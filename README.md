# jain-dharamshaala

## RUN
npm start.


## Build and push the image
$(aws ecr get-login --no-include-email --region region-name)
docker build -t jain-dharamshaala .
docker tag jain-dharamshaala:latest your-ecr-repo-url/jain-dharamshaala:latest
docker push your-ecr-repo-url/jain-dharamshaala:latest


## k8s deploy app
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml