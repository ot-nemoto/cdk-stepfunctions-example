# cdk-stepfunctions-example

```
+------+    +------+    +------+    +------+    +-------+
|Lambda| -> |Pass-1| -> |Pass-2| -> |Pass-3| -> |Succeed|
+------+    +------+    +------+    +------+    +-------+
```

- Lambda で 1 か月後、2 か月後、3 か月後の月初、月末の日時を作成
- Pass-1 では 1 か月後の月初、月末を取り込む
- Pass-2 では 2 か月後の月初、月末を取り込む
- Pass-3 では 3 か月後の月初、月末を取り込む

_Environment_

```sh
export ECS_CLUSTER_ARN=your_ecs_cluster_arn
export ECS_TASK_DEFINITION_ARN=your_ecs_task_definition_arn
export ECS_TASK_ROLE_ARN=your_task_role_arn
export ECS_TASK_EXECUTION_ROLE_ARN=your_task_execution_role_arn
# If there are multiple, separate them with commas
export ECS_SUBNETS=your_subnets
# If there are multiple, separate them with commas
export ECS_SECURITY_GROUPS=your_security_groups
```
