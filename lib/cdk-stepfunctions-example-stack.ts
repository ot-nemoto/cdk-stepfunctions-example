import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkStepfunctionsExampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Lambda
    const helloFunction = new lambda.Function(this, 'MyLambdaFunction', {
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(3),
    });

    // https://dev.classmethod.jp/articles/cdk_stepfunctions_run_task_with_existing_taskdef/
    // https://github.com/aws/aws-cdk/pull/24098
    type RunTaskStateParam = {
      Type: 'Task';
      Resource: 'arn:aws:states:::ecs:runTask.sync';
      Parameters: {
        LaunchType: 'FARGATE';
        Cluster: string;
        TaskDefinition: string;
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: string;
            Subnets: string[];
            SecurityGroups: string[];
          };
        };
        Overrides: {
          ContainerOverrides: [{}];
        };
      };
      InputPath: string;
      ResultPath: string;
    };

    const runTaskStateParam1: RunTaskStateParam = {
      Type: 'Task',
      Resource: 'arn:aws:states:::ecs:runTask.sync',
      Parameters: {
        LaunchType: 'FARGATE',
        Cluster: process.env.ECS_CLUSTER_ARN || '',
        TaskDefinition: process.env.ECS_TASK_DEFINITION_ARN || '',
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: 'ENABLED',
            Subnets: (process.env.ECS_SUBNETS || '').split(','),
            SecurityGroups: (process.env.ECS_SECURITY_GROUPS || '').split(','),
          },
        },
        Overrides: {
          ContainerOverrides: [
            {
              Name: 'APP',
              'Command.$': '$.commands',
            },
          ],
        },
      },
      InputPath: '$.Payload.run_tasks[0].input',
      ResultPath: sfn.JsonPath.DISCARD,
    };

    const runTaskStateParam2: RunTaskStateParam = {
      Type: 'Task',
      Resource: 'arn:aws:states:::ecs:runTask.sync',
      Parameters: {
        LaunchType: 'FARGATE',
        Cluster: process.env.ECS_CLUSTER_ARN || '',
        TaskDefinition: process.env.ECS_TASK_DEFINITION_ARN || '',
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: 'ENABLED',
            Subnets: (process.env.ECS_SUBNETS || '').split(','),
            SecurityGroups: (process.env.ECS_SECURITY_GROUPS || '').split(','),
          },
        },
        Overrides: {
          ContainerOverrides: [
            {
              Name: 'APP',
              'Command.$': '$.commands',
            },
          ],
        },
      },
      InputPath: '$.Payload.run_tasks[1].input',
      ResultPath: sfn.JsonPath.DISCARD,
    };

    const runTaskStateParam3: RunTaskStateParam = {
      Type: 'Task',
      Resource: 'arn:aws:states:::ecs:runTask.sync',
      Parameters: {
        LaunchType: 'FARGATE',
        Cluster: process.env.ECS_CLUSTER_ARN || '',
        TaskDefinition: process.env.ECS_TASK_DEFINITION_ARN || '',
        NetworkConfiguration: {
          AwsvpcConfiguration: {
            AssignPublicIp: 'ENABLED',
            Subnets: (process.env.ECS_SUBNETS || '').split(','),
            SecurityGroups: (process.env.ECS_SECURITY_GROUPS || '').split(','),
          },
        },
        Overrides: {
          ContainerOverrides: [
            {
              Name: 'APP',
              'Command.$': '$.commands',
            },
          ],
        },
      },
      InputPath: '$.Payload.run_tasks[2].input',
      ResultPath: sfn.JsonPath.DISCARD,
    };

    // StepFunctions
    const definition = new tasks.LambdaInvoke(this, 'MyLambdaTask', {
      lambdaFunction: helloFunction,
    })
      .next(
        new sfn.Pass(this, 'Pass-1', {
          parameters: {
            commands: [
              'python',
              'manage.py',
              '--start_date',
              '$.Payload.date_ranges[0].sdate',
              '--end_date',
              '$.Payload.date_ranges[0].edate',
            ],
          },
          resultPath: sfn.JsonPath.DISCARD,
        })
      )
      .next(
        new sfn.CustomState(this, 'RunTask-1', {
          stateJson: runTaskStateParam1,
        })
      )
      .next(
        new sfn.Pass(this, 'Pass-2', {
          parameters: {
            commands: [
              'python',
              'manage.py',
              '--start_date',
              '$.Payload.date_ranges[1].sdate',
              '--end_date',
              '$.Payload.date_ranges[1].edate',
            ],
          },
          resultPath: sfn.JsonPath.DISCARD,
        })
      )
      .next(
        new sfn.CustomState(this, 'RunTask-2', {
          stateJson: runTaskStateParam2,
        })
      )
      .next(
        new sfn.Pass(this, 'Pass-3', {
          parameters: {
            commands: [
              'python',
              'manage.py',
              '--start_date',
              '$.Payload.date_ranges[2].sdate',
              '--end_date',
              '$.Payload.date_ranges[2].edate',
            ],
          },
          resultPath: sfn.JsonPath.DISCARD,
        })
      )
      .next(
        new sfn.CustomState(this, 'RunTask-3', {
          stateJson: runTaskStateParam3,
        })
      )
      .next(new sfn.Succeed(this, 'Succeed'));

    const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    });
    stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['events:PutRule', 'events:PutTargets'],
        effect: iam.Effect.ALLOW,
        resources: ['*'],
      })
    );
    stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['ecs:RunTask'],
        effect: iam.Effect.ALLOW,
        resources: [`${process.env.ECS_TASK_DEFINITION_ARN || ''}:*`],
      })
    );
    stateMachine.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['iam:PassRole'],
        effect: iam.Effect.ALLOW,
        resources: [
          process.env.ECS_TASK_ROLE_ARN || '',
          process.env.ECS_TASK_EXECUTION_ROLE_ARN || '',
        ],
      })
    );
  }
}
