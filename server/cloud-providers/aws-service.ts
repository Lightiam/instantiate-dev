import { v4 as uuidv4 } from 'uuid';
import { 
  ECSClient, 
  CreateServiceCommand, 
  CreateClusterCommand,
  RegisterTaskDefinitionCommand 
} from '@aws-sdk/client-ecs';
import { 
  EC2Client, 
  RunInstancesCommand, 
  DescribeInstancesCommand 
} from '@aws-sdk/client-ec2';
import { 
  LambdaClient, 
  CreateFunctionCommand 
} from '@aws-sdk/client-lambda';
import { 
  S3Client, 
  CreateBucketCommand 
} from '@aws-sdk/client-s3';
import { 
  EKSClient, 
  CreateClusterCommand as EKSCreateClusterCommand 
} from '@aws-sdk/client-eks';

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  sessionToken?: string;
}

interface AWSDeploymentResult {
  success: boolean;
  deploymentId?: string;
  region?: string;
  error?: string;
  resources?: any[];
  ipAddress?: string;
}

interface AWSDeploymentSpec {
  name: string;
  image?: string;
  resourceGroup?: string;
  location?: string;
  region?: string;
  cpu?: number;
  memory?: number;
  ports?: number[];
  environmentVariables?: Record<string, string>;
  service?: string;
  code?: string;
  codeType?: string;
}

export class AWSService {
  private credentials: AWSCredentials | null = null;

  setCredentials(credentials: AWSCredentials) {
    this.credentials = credentials;
  }

  async testConnection(credentials: AWSCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Testing AWS connection with credentials');
      
      const ec2Client = new EC2Client({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken
        }
      });
      
      await ec2Client.send(new DescribeInstancesCommand({}));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deployECSContainer(spec: AWSDeploymentSpec): Promise<AWSDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('AWS credentials not configured');
      }

      console.log(`Deploying ECS container: ${spec.name}`);
      
      const ecsClient = new ECSClient({
        region: spec.region || this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken
        }
      });

      const clusterName = `${spec.name}-cluster`;
      await ecsClient.send(new CreateClusterCommand({
        clusterName: clusterName
      }));

      const taskDefinition = await ecsClient.send(new RegisterTaskDefinitionCommand({
        family: spec.name,
        networkMode: 'awsvpc',
        requiresCompatibilities: ['FARGATE'],
        cpu: String((spec.cpu || 0.5) * 1024),
        memory: String((spec.memory || 1.0) * 1024),
        containerDefinitions: [{
          name: spec.name,
          image: spec.image || 'nginx:alpine',
          portMappings: spec.ports ? spec.ports.map(port => ({
            containerPort: port,
            protocol: 'tcp'
          })) : [{ containerPort: 80, protocol: 'tcp' }],
          environment: spec.environmentVariables ? Object.entries(spec.environmentVariables).map(([name, value]) => ({
            name,
            value: String(value)
          })) : []
        }]
      }));

      const service = await ecsClient.send(new CreateServiceCommand({
        cluster: clusterName,
        serviceName: spec.name,
        taskDefinition: taskDefinition.taskDefinition?.taskDefinitionArn,
        desiredCount: 1,
        launchType: 'FARGATE'
      }));
      
      return {
        success: true,
        deploymentId: service.service?.serviceArn || uuidv4(),
        region: spec.region || this.credentials.region,
        resources: [service.service]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deployEC2Instance(spec: AWSDeploymentSpec): Promise<AWSDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('AWS credentials not configured');
      }

      console.log(`Deploying EC2 instance: ${spec.name}`);
      
      const ec2Client = new EC2Client({
        region: spec.region || this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken
        }
      });

      const runInstancesCommand = new RunInstancesCommand({
        ImageId: 'ami-0c02fb55956c7d316', // Amazon Linux 2 AMI
        InstanceType: 't2.micro',
        MinCount: 1,
        MaxCount: 1,
        TagSpecifications: [{
          ResourceType: 'instance',
          Tags: [
            { Key: 'Name', Value: spec.name },
            { Key: 'CreatedBy', Value: 'Instantiate.dev' }
          ]
        }]
      });

      const result = await ec2Client.send(runInstancesCommand);
      const instance = result.Instances?.[0];
      
      return {
        success: true,
        deploymentId: instance?.InstanceId || uuidv4(),
        region: spec.region || this.credentials.region,
        ipAddress: instance?.PublicIpAddress,
        resources: [instance]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deployLambdaFunction(spec: AWSDeploymentSpec): Promise<AWSDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('AWS credentials not configured');
      }

      console.log(`Deploying Lambda function: ${spec.name}`);
      
      const lambdaClient = new LambdaClient({
        region: spec.region || this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken
        }
      });

      const functionCode = spec.code || `
exports.handler = async (event) => {
    return {
        statusCode: 200,
        body: JSON.stringify('Hello from ${spec.name}!')
    };
};`;

      const createFunctionCommand = new CreateFunctionCommand({
        FunctionName: spec.name,
        Runtime: 'nodejs18.x',
        Role: `arn:aws:iam::${this.credentials.accessKeyId.substring(0, 12)}:role/lambda-execution-role`,
        Handler: 'index.handler',
        Code: {
          ZipFile: Buffer.from(functionCode)
        },
        Environment: {
          Variables: spec.environmentVariables || {}
        },
        Tags: {
          'CreatedBy': 'Instantiate.dev'
        }
      });

      const result = await lambdaClient.send(createFunctionCommand);
      
      return {
        success: true,
        deploymentId: result.FunctionArn || uuidv4(),
        region: spec.region || this.credentials.region,
        resources: [result]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deployEKSCluster(spec: AWSDeploymentSpec): Promise<AWSDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('AWS credentials not configured');
      }

      console.log(`Deploying EKS cluster: ${spec.name}`);
      
      const eksClient = new EKSClient({
        region: spec.region || this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken
        }
      });

      const createClusterCommand = new EKSCreateClusterCommand({
        name: spec.name,
        version: '1.28',
        roleArn: `arn:aws:iam::${this.credentials.accessKeyId.substring(0, 12)}:role/eks-service-role`,
        resourcesVpcConfig: {
          subnetIds: [], // Would need to be provided or created
        },
        tags: {
          'CreatedBy': 'Instantiate.dev'
        }
      });

      const result = await eksClient.send(createClusterCommand);
      
      return {
        success: true,
        deploymentId: result.cluster?.arn || uuidv4(),
        region: spec.region || this.credentials.region,
        resources: [result.cluster]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createS3Bucket(spec: AWSDeploymentSpec): Promise<AWSDeploymentResult> {
    try {
      if (!this.credentials) {
        throw new Error('AWS credentials not configured');
      }

      console.log(`Creating S3 bucket: ${spec.name}`);
      
      const s3Client = new S3Client({
        region: spec.region || this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken
        }
      });

      const bucketConfig: any = {
        Bucket: spec.name
      };
      
      if (spec.region !== 'us-east-1') {
        bucketConfig.CreateBucketConfiguration = {
          LocationConstraint: spec.region || this.credentials.region
        };
      }
      
      const createBucketCommand = new CreateBucketCommand(bucketConfig);

      const result = await s3Client.send(createBucketCommand);
      
      return {
        success: true,
        deploymentId: result.Location || uuidv4(),
        region: spec.region || this.credentials.region,
        resources: [{
          name: spec.name,
          type: 'AWS::S3::Bucket',
          region: spec.region || this.credentials.region,
          location: result.Location
        }]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listResources(): Promise<any[]> {
    try {
      if (!this.credentials) {
        return [];
      }
      
      const ec2Client = new EC2Client({
        region: this.credentials.region,
        credentials: {
          accessKeyId: this.credentials.accessKeyId,
          secretAccessKey: this.credentials.secretAccessKey,
          sessionToken: this.credentials.sessionToken
        }
      });

      const instancesResult = await ec2Client.send(new DescribeInstancesCommand({}));
      const instances = instancesResult.Reservations?.flatMap(r => r.Instances || []) || [];
      
      return instances.map(instance => ({
        name: instance.Tags?.find(tag => tag.Key === 'Name')?.Value || instance.InstanceId,
        type: 'AWS::EC2::Instance',
        status: instance.State?.Name || 'unknown',
        instanceId: instance.InstanceId,
        region: this.credentials.region
      }));
    } catch (error: any) {
      console.error('Error listing AWS resources:', error);
      return [];
    }
  }
}

export const awsService = new AWSService();
