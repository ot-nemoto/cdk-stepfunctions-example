import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sfn from 'aws-cdk-lib/aws-stepfunctions';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks';

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
      .next(new sfn.Succeed(this, 'Succeed'));

    const stateMachine = new sfn.StateMachine(this, 'MyStateMachine', {
      definitionBody: sfn.DefinitionBody.fromChainable(definition),
    });
  }
}
