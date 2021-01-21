# MSM Health Equity Tracker Backend

Codebase for [Health Equity Tracker](https://healthequitytracker.org/).

## Contributing

To contribute to this project:

1. [Fork the repository on github](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo)
2. On your development machine, clone your forked repo and add the official repo as a remote.
    - Tip: by convention, the official repo is added with the name `upstream`. This can be done with the command `git remote add upstream git@github.com:SatcherInstitute/<repo>.git`

When you're ready to make changes:

1. Pull the latest changes from the official repo.
    - Tip: If your official remote is named `upstream`, run `git pull upstream master`
2. Create a local branch, make changes, and commit to your local branch. Repeat until changes are ready for review.
3. [Optional] Rebase your commits so you have few commits with clear commit messages.
4. Push your branch to your remote fork, use the github UI to open a pull request (PR), and add reviewer(s).
5. Push new commits to your remote branch as you respond to reviewer comments.
    - Note: once a PR is under review, don't rebase changes you've already pushed to the PR. This can confuse reviewers.
6. When ready to submit, use the "Squash and merge" option. This maintains linear history and ensures your entire PR is merged as a single commit, while being simple to use in most cases. If there are conflicts, pull the latest changes from master, merge them into your PR, and try again.

Note that there are a few downsides to "Squash and merge"

- The official repo will not show commits from collaborators if the PR is a collaborative branch.
- Working off the same branch or a dependent branch duplicates commits on the dependent branch and can cause repeated merge conflicts. To work around this, if you have a PR `my_branch_1` and you want to start work on a new PR that is dependent on `my_branch_1`, you can do the following:
  1. Create a new local branch `my_branch_2` based on `my_branch_1`. Continue to develop on `my_branch_2`.
  2. If `my_branch_1` is updated (including by merging changes from master), switch to `my_branch_2` and run `git rebase -i my_branch_1` to incorporate the changes into `my_branch_2` while maintaining the the branch dependency.
  3. When review is done, squash and merge `my_branch_1`. Don't delete `my_branch_1`yet.
  4. From local client, go to master branch and pull from master to update the local master branch with the squashed change.
  5. From local client, run `git rebase --onto master my_branch_1 my_branch_2`. This tells git to move all the commits between `my_branch_1` and `my_branch_2` onto master. You can now delete `my_branch_1`.

Read more about the forking workflow [here](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow). For details on "Squash and merge" see [here](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/about-merge-methods-on-github#squashing-your-merge-commits)

## One-time development setup

Install Cloud SDK ([Quickstart](https://cloud.google.com/sdk/docs/quickstart))  
Install Terraform ([Getting started](https://learn.hashicorp.com/tutorials/terraform/install-cli?in=terraform/gcp-get-started))  
Install Docker Desktop ([Get Docker](https://docs.docker.com/get-docker/))

`gcloud config set project <project-id>`

## Testing

Unit tests can be run using pytest. Running pytest will recursively look for and execute test files.

```bash
pip install pytest
pytest
```

To test from the packaged version of the ingestion library, run `pip install -e python/ingestion` before testing.

### Python environment setup

1. Create a virtual environment in your project directory, for example: `python3 -m venv .venv`
2. Activate the venv: `source .venv/bin/activate`
3. Install pip-tools and other packages as needed: `pip install pip-tools`

## Testing Pub/Sub triggers

To test a Cloud Run service triggered by a Pub/Sub topic, run
`gcloud pubsub topics publish projects/<project-id>/topics/<your_topic_name> --message "your_message" --attribute=KEY1=VAL1,KEY2=VAL2`

See [Documentation](https://cloud.google.com/sdk/gcloud/reference/pubsub/topics/publish) for details.

## Shared python code

Most python code should go in the `/python` directory, which contains packages that can be installed into any service. Each sub-directory of `/python` is a package with an `__init__.py` file, a `setup.py` file, and a `requirements.in` file. Shared code should go in one of these packages. If a new sub-package is added:

1. Create a folder `/python/<new_package>`. Inside, add:

   - An empty `__init__.py` file
   - A `setup.py` file with options: `name=<new_package>`, `package_dir={'<new_package>': ''}`, and `packages=['<new_package>']`
   - A `requirements.in` file with the necessary dependencies

2. For each service that depends on `/python/<new_package>`, follow instructions at [Adding an internal dependency](#adding-an-internal-dependency)

To work with the code locally, run `pip install ./python/<package>` from the root project directory. If your IDE complains about imports after changing code in `/python`, re-run `pip install ./python/<package>`.

## Adding a new root-level python directory

Note: generally this should only be done for a new service. Otherwise, please add python code to the `python/` directory.

When adding a new python root-level python directory, be sure to update `.github/workflows/linter.yml` to ensure the directory is linted and type-checked.

## Adding python dependencies

### Adding an external dependency

1. Add the dependency to the appropriate `requirements.in` file.
   - If the dependency is used by `/python/<package>`, add it to the `/python/<package>/requirements.in` file.
   - If the dependency is used directly by a service, add it to the `<service_directory>/requirements.in` file.

1. For each service that needs the dependency (for deps in `/python/<package>` this means every service that depends on `/python/<package>`):
   - Run `cd <service_directory>`, then `pip-compile requirements.in` where `<service_directory>` is the root-level directory for the service. This will generate a `requirements.txt` file.
   - Run `pip install -r requirements.txt` to ensure your local environment has the dependencies, or run `pip install <new_dep>` directly. Note, you'll first need to have followed the python environment setup described above [Python environment setup](#python-environment-setup).

1. Update the requirements.txt for unit tests  
`pip-compile python/tests/requirements.in -o python/tests/requirements.txt`

### Adding an internal dependency

If a service adds a dependency on `/python/<some_package>`:

- Add `-r ../python/<some_package>/requirements.in` to the `<service_directory>/requirements.in` file. This will ensure that any deps needed for the package get installed for the service.
- Follow step 2 of [Adding an external dependency](#adding-an-external-dependency) to generate the relevant `requirements.txt` files.
- Add the line `RUN pip install ./python/<some_package>` to `<service_directory>/Dockerfile`

## Launch the data ingestion pipeline on your local machine

### Set up

- Install [Docker](https://www.docker.com/)
- Install [Docker Compose](https://docs.docker.com/compose/install/)
- Set environment variables
  - PROJECT_ID
  - GCP_KEY_PATH (See [documentation](https://cloud.google.com/iam/docs/creating-managing-service-account-keys#creating_service_account_keys) on creating and downloading keys.)
  - DATASET_NAME
  - GCS_LANDING_BUCKET
  - GCS_MANUAL_UPLOADS_BUCKET
  - MANUAL_UPLOADS_DATASET
  - MANUAL_UPLOADS_PROJECT
  - EXPORT_BUCKET

### Getting Started

From inside the `airflow/dev/` directory:

1. Build the Docker containers

    `make build`

1. Stand up the multi-container environment

   `make run`

1. At the UI link below, you should see the list of DAGs pulled from the `dags/` folder. These files will automatically update the Airflow webserver when changed.
1. To run them manually, select the desired DAG, toggle to `On` and click `Trigger Dag` .
1. When finished, turn down the containers

   `make kill`

More info on [Apache Airflow](https://airflow.apache.org/docs/stable/) in general.

### Airflow UI link

- [localhost:8080](http://localhost:8080/)

## Developing locally with BigQuery

To upload to BigQuery from your local development environment, use [these setup directions](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries) with an experimental Cloud project. This may be useful when iterating quickly if your Cloud Run ingestion job isn’t able to upload to BigQuery for some reason such as JSON parsing errors.

## Deploying your own instance with terraform

Before deploying, make sure you have installed Terraform and a Docker client (e.g. Docker Desktop). See [One time setup](#one-time-setup) above.

1. Create your own `terraform.tfvars` file in the same directory as the other terraform files. For each variable declared in `prototype_variables.tf` that doesn't have a default, add your own for testing. Typically your own variables should be unique and can just be prefixed with your name or ldap. There are some that have specific requirements like project ids, code paths, and image paths.
2. Configure docker to use credentials through gcloud.
   `gcloud auth configure-docker`
3. On the command line, navigate to your project directory and initialize terraform.  

   ```bash
   cd path/to/your/project
   terraform init
   ```

4. Build and push your Docker images to Google Container Registry. Select any unique identifier for `your-[ingestion|gcs-to-bq]-image-name`.

   ```bash
   # Build the images locally
   docker build -t gcr.io/<project-id>/<your-ingestion-image-name> -f run_ingestion/Dockerfile .
   docker build -t gcr.io/<project-id>/<your-gcs-to-bq-image-name> -f run_gcs_to_bq/Dockerfile .

   # Upload the image to Google Container Registry
   docker push gcr.io/<project-id>/<your-ingestion-image-name>
   docker push gcr.io/<project-id>/<your-gcs-to-bq-image-name>
   ```

5. Deploy via Terraform.  

   ```bash
   # Get the latest image digests
   export TF_VAR_ingestion_image_name=$(gcloud container images describe gcr.io/<project-id>/<your-ingestion-image-name> \
   --format="value(image_summary.digest)")
   export TF_VAR_gcs_to_bq_image_name=$(gcloud container images describe gcr.io/<project-id>/<your-gcs-to-bq-image-name> \
   --format="value(image_summary.digest)")

   # Deploy via terraform, providing the paths to the latest images so it knows to redeploy
   terraform apply -var="ingestion_image_name=<your-ingestion-image-name>@$TF_VAR_ingestion_image_name" \
   -var="gcs_to_bq_image_name=<your-gcs-to-bq-image-name>@$TF_VAR_gcs_to_bq_image_name"
   ```

   Alternatively, if you aren't familiar with bash or are on Windows, you can run the above `gcloud container images describe` commands manually and copy/paste the output into your tfvars file for the `ingestion_image_name` and `gcs_to_bq_image_name` variables.

6. To redeploy, e.g. after making changes to a Cloud Run service, repeat steps 4-5. Make sure you run the commands from your base project dir.

### Terraform deployment notes

Terraform doesn't automatically diff the contents of cloud run services, so simply calling `terraform apply` after making code changes won't upload your new changes. This is why Steps 4 and 5 are needed above. Here is an alternative:

Use [`terraform taint`](https://www.terraform.io/docs/commands/taint.html) to mark a resource as requiring redeploy. Eg `terraform taint google_cloud_run_service.ingestion_service`.
You can then set the `ingestion_image_name` variable in your tfvars file to `<your-ingestion-image-name>` and `gcs_to_bq_image_name` to `<your-gcs-to-bq-image-name>`. Then replace Step 5 above with just `terraform apply`. Step 4 is still required.

## Accessing the Terraform UI Deployed
Go to pantheon.corp.google.com.

Search for Composer

A list of environments should be present.  Look for data-ingestion-environment

Click into the details, and navigate to the environment configuration tab.

One of the properties listed is Airflow web UI.

## Test and Production Environments

### A note on Airflow DAGS

All files in the airflows/dags directory will be uploaded to the test airflow environment. Please only put DAG files in this directory. 

## frontend

### Developer Instructions 

Code in the `frontend/` directory was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). In that directory you can run various `npm` scripts, which are described below.

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

_Note: The following instructions assume running all commands from the `frontend/` directory._

#### Install

Change directories to the `frontend/` directory, then install dependencies using NPM.  

_Note: you will need a compatible verison of Node.JS and NPM installed locally. See the "engines" field in `frontend/package.json` for the required / minimum versions of each. It's recommended to use [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm) if you need to have multiple versions of Node.JS / NPM installed on your machine._

```bash
cd frontend && npm install
```

##### Trouble-shooting

If you encounter errors during install that mention `gyp`, that refers to a Node.js native addon build tool that is required for some modules. Follow the instructions on the [gyp github repo](https://github.com/nodejs/node-gyp#installation) for installation and setting up required dependencies (eg Python and certain build tools like XCode Command Line Tools for OS X).

#### Develop

To run the app in development mode, start a local web server, and watch for changes do:

```bash
npm start
```

The site should now be visible at `localhost:3000`. Any changes to source code will cause a live reload of the site.

#### Tests

To run unit tests do:

```bash
npm test
```

This will run tests in watch mode, so you may have the tests running while developing.

#### Build

To create a "production" build do:

```bash
npm run build
```

This should output bundled files in the `frontend/build/` directory. These are the files that are used for hosting the app in production environments.

#### Ejecting Create React App

_Note: this is a one-way operation. Once you `eject`, you can’t go back!_

If you aren’t satisfied with the Create React App build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

#### Storybook

Storybook is a library that allows us to explore and develop UI components in isolation. Bring up our Storybook by running this command in the `frontend/` directory:

```bash
npm run storybook
```

Stories for each UI component are contained in the same directory as the component in a subfolder called "storybook".

Current master branch version of Storybook can be seen here: https://storybook.healthequitytracker.org

## License

[MIT](./LICENSE)
