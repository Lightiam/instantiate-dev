import AWS from 'aws-sdk';
import fetch from 'node-fetch';

interface AWSDeploymentRequest {
  name: string;
  code: string;
  codeType: 'javascript' | 'python' | 'html';
  region: string;
  service: 'lambda' | 'ec2' | 's3' | 'ecs';
  environmentVariables?: Record<string, string>;
}

interface AWSResource {
  id: string;
  name: string;
  type: string;
  region: string;
  status: string;
  cost?: number;
  url?: string;
  createdAt: string;
}

export class AWSService {
  private credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
  };

  constructor() {
    if (this.credentials.accessKeyId && this.credentials.secretAccessKey) {
      AWS.config.update(this.credentials);
    }
  }

  async deployLambda(spec: AWSDeploymentRequest): Promise<any> {
    if (!this.credentials.accessKeyId) {
      throw new Error('AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
    }

    const lambda = new AWS.Lambda({ region: spec.region });
    const functionName = `${spec.name}-${Date.now()}`;

    const zipBuffer = this.createDeploymentPackage(spec);

    const params = {
      FunctionName: functionName,
      Runtime: spec.codeType === 'javascript' ? 'nodejs18.x' : 'python3.9',
      Role: process.env.AWS_LAMBDA_EXECUTION_ROLE || 'arn:aws:iam::123456789012:role/lambda-execution-role',
      Handler: spec.codeType === 'javascript' ? 'index.handler' : 'lambda_function.lambda_handler',
      Code: { ZipFile: zipBuffer },
      Description: `Deployed via Instantiate - ${spec.name}`,
      Environment: {
        Variables: spec.environmentVariables || {}
      },
      Tags: {
        'CreatedBy': 'Instantiate',
        'DeploymentTime': new Date().toISOString()
      }
    };

    try {
      const result = await lambda.createFunction(params).promise();
      return {
        id: result.FunctionArn,
        name: functionName,
        type: 'lambda',
        region: spec.region,
        status: 'deployed',
        url: `https://${spec.region}.console.aws.amazon.com/lambda/home?region=${spec.region}#/functions/${functionName}`,
        createdAt: new Date().toISOString(),
        logs: [`AWS Lambda function ${functionName} deployed successfully`]
      };
    } catch (error: any) {
      throw new Error(`AWS Lambda deployment failed: ${error.message}`);
    }
  }

  async deployS3Website(spec: AWSDeploymentRequest): Promise<any> {
    if (!this.credentials.accessKeyId) {
      throw new Error('AWS credentials not configured.');
    }

    const s3 = new AWS.S3({ region: spec.region });
    const bucketName = `${spec.name}-${Date.now()}`.toLowerCase();

    try {
      await s3.createBucket({
        Bucket: bucketName,
        CreateBucketConfiguration: {
          LocationConstraint: spec.region !== 'us-east-1' ? spec.region as any : undefined
        }
      }).promise();

      await s3.putBucketWebsite({
        Bucket: bucketName,
        WebsiteConfiguration: {
          IndexDocument: { Suffix: 'index.html' },
          ErrorDocument: { Key: 'error.html' }
        }
      }).promise();

      await s3.putBucketPolicy({
        Bucket: bucketName,
        Policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [{
            Sid: 'PublicReadGetObject',
            Effect: 'Allow',
            Principal: '*',
            Action: 's3:GetObject',
            Resource: `arn:aws:s3:::${bucketName}/*`
          }]
        })
      }).promise();

      await s3.putObject({
        Bucket: bucketName,
        Key: 'index.html',
        Body: spec.code,
        ContentType: 'text/html',
        CacheControl: 'max-age=31536000'
      }).promise();

      const websiteUrl = `http://${bucketName}.s3-website-${spec.region}.amazonaws.com`;

      return {
        id: bucketName,
        name: spec.name,
        type: 's3-website',
        region: spec.region,
        status: 'deployed',
        url: websiteUrl,
        createdAt: new Date().toISOString(),
        logs: [`S3 static website deployed to ${websiteUrl}`]
      };
    } catch (error: any) {
      throw new Error(`AWS S3 deployment failed: ${error.message}`);
    }
  }

  async listResources(): Promise<AWSResource[]> {
    if (!this.credentials.accessKeyId) {
      return [];
    }

    const resources: AWSResource[] = [];

    try {
      const lambda = new AWS.Lambda();
      const functions = await lambda.listFunctions().promise();
      
      functions.Functions?.forEach(func => {
        if (func.Tags?.['CreatedBy'] === 'Instantiate') {
          resources.push({
            id: func.FunctionArn || '',
            name: func.FunctionName || '',
            type: 'lambda',
            region: func.CodeSha256?.slice(0, 10) || 'unknown',
            status: func.State || 'unknown',
            createdAt: func.LastModified || new Date().toISOString()
          });
        }
      });

      const s3 = new AWS.S3();
      const buckets = await s3.listBuckets().promise();
      
      for (const bucket of buckets.Buckets || []) {
        if (bucket.Name?.includes('instantiate') || bucket.Name?.includes('deploy')) {
          try {
            const tags = await s3.getBucketTagging({ Bucket: bucket.Name }).promise();
            const isInstantiate = tags.TagSet?.some(tag => tag.Key === 'CreatedBy' && tag.Value === 'Instantiate');
            
            if (isInstantiate) {
              resources.push({
                id: bucket.Name,
                name: bucket.Name,
                type: 's3-bucket',
                region: 'global',
                status: 'active',
                createdAt: bucket.CreationDate?.toISOString() || new Date().toISOString()
              });
            }
          } catch (e) {
            // Skip buckets without tags
          }
        }
      }
    } catch (error: any) {
      console.error('Error listing AWS resources:', error.message);
    }

    return resources;
  }

  async getResourceStatus(resourceId: string, resourceType: string): Promise<any> {
    if (!this.credentials.accessKeyId) {
      throw new Error('AWS credentials not configured.');
    }

    try {
      if (resourceType === 'lambda') {
        const lambda = new AWS.Lambda();
        const result = await lambda.getFunction({ FunctionName: resourceId }).promise();
        return {
          status: result.Configuration?.State,
          lastModified: result.Configuration?.LastModified,
          runtime: result.Configuration?.Runtime,
          memorySize: result.Configuration?.MemorySize
        };
      } else if (resourceType === 's3-website' || resourceType === 's3-bucket') {
        const s3 = new AWS.S3();
        const result = await s3.headBucket({ Bucket: resourceId }).promise();
        return {
          status: 'active',
          region: result.$response.httpResponse.headers['x-amz-bucket-region']
        };
      }
    } catch (error: any) {
      return { status: 'error', error: error.message };
    }
  }

  private createDeploymentPackage(spec: AWSDeploymentRequest): Buffer {
    let codeContent: string;
    
    if (spec.codeType === 'javascript') {
      codeContent = spec.code.includes('exports.handler') ? spec.code : 
        `exports.handler = async (event) => {
          ${spec.code}
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Success from ${spec.name}' })
          };
        };`;
    } else {
      codeContent = spec.code.includes('def lambda_handler') ? spec.code :
        `def lambda_handler(event, context):
          ${spec.code.split('\n').map(line => '    ' + line).join('\n')}
          return {
            'statusCode': 200,
            'body': '{"message": "Success from ${spec.name}"}'
          }`;
    }

    return Buffer.from(codeContent);
  }
}

export const awsService = new AWSService();