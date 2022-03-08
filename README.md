# Health Equity Tracker

Codebase for the [Health Equity Tracker](https://healthequitytracker.org/), Satcher Health Leadership Institute, Morehouse School of Medicine.

> Prompted by the COVID-19 pandemic, the Health Equity Tracker was created in 2020 to aggregate up-to-date demographic data from the hardest-hit communities. The Health Equity Tracker aims to give a detailed view of health outcomes by race, ethnicity, sex, socioeconomic status, and other critical factors. Our hope is that it will help policymakers understand what resources and support affected communities need to be able to improve their outcomes.

[![GitHub Super-Linter](https://github.com/SatcherInstitute/health-equity-tracker/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)

## Contributing

To contribute to this project:

1. [Fork the repository on github](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo)
2. On your development machine, clone your forked repo and add the official repo as a remote.
    - Tip: our development team keeps the remote name `origin` for the original repo, and uses a different name for our forked remote like `josh` or `ben`.

When you're ready to make changes:

1. Pull the latest changes from the official repo.
    - Tip: If your official remote is named `origin`, run `git pull origin main`
2. Create a local branch, make changes, and commit to your local branch. Repeat until changes are ready for review.
3. [Optional] Rebase your commits so you have few commits with clear commit messages.
4. Push your branch to your remote fork, use the github UI to open a pull request (PR), and add reviewer(s).
5. Push new commits to your remote branch as you respond to reviewer comments.
    - Note: once a PR is under review, don't rebase changes you've already pushed to the PR. This can confuse reviewers.
6. When ready to submit, use the "Squash and merge" option (found under the submit button dropdown options). This maintains linear history and ensures your entire PR is merged as a single commit, while being simple to use in most cases. If there are conflicts, pull the latest changes from main, merge them into your PR, and try again.

Note that there are a few downsides to "Squash and merge"

- The official repo will not show commits from collaborators if the PR is a collaborative branch.
- Working off the same branch or a dependent branch duplicates commits on the dependent branch and can cause repeated merge conflicts. To work around this, if you have a PR `my_branch_1` and you want to start work on a new PR that is dependent on `my_branch_1`, you can do the following:
  1. Create a new local branch `my_branch_2` based on `my_branch_1`. Continue to develop on `my_branch_2`.
  2. If `my_branch_1` is updated (including by merging changes from main), switch to `my_branch_2` and run `git rebase -i my_branch_1` to incorporate the changes into `my_branch_2` while maintaining the the branch dependency.
  3. When review is done, squash and merge `my_branch_1`. Don't delete `my_branch_1`yet.
  4. From local client, go to main branch and pull from main to update the local main branch with the squashed change.
  5. From local client, run `git rebase --onto main my_branch_1 my_branch_2`. This tells git to move all the commits between `my_branch_1` and `my_branch_2` onto main. You can now delete `my_branch_1`.

Read more about the forking workflow [here](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow). For details on "Squash and merge" see [here](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/about-merge-methods-on-github#squashing-your-merge-commits)

# Frontend

The frontend consists of
1. `health-equity-tracker/frontend/`: A React app that contains all code and static resources needed in the browser (html, JS, CSS, images). This app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Documentation on Create React App can be found [here](https://create-react-app.dev/docs/getting-started/).
2. `health-equity-tracker/frontend_server/`: A lightweight server that serves the React app as static files and forwards data requests to the data server.
3. `health-equity-tracker/data_server/`: A data server that responds to data requests by serving data files that have been exported from the data pipeline.

In addition, we have a Storybook project that also lives in `health-equity-tracker/frontend/`. Storybook is a library that allows us to explore and develop UI components in isolation. Stories for each UI component are contained in the same directory as the component in a subfolder called "storybook". The current main branch version of Storybook can be seen here: https://het-storybook.netlify.app

### Frontend React App Environments

The frontend React App runs in different environments. We use configuration files (`frontend/.env.prod`, `frontend/.env.staging`, etc) to control settings in different environments. These include things like the data server URL and logging settings. These can be overridden for local development using a `frontend/.env.development` file.

### Running just the React App locally

#### One Time Setup

Switch to the `frontend/` directory, then install dependencies using NPM.

_Note: you will need a compatible version of Node.JS and NPM installed locally; see the "engines" field in `frontend/package.json` for the required  of each. It's recommended to use [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm) if you need to have multiple versions of Node.JS / NPM installed on your machine, though members have also had success with Homebrew._

```bash
cd frontend && npm install
```

#### Trouble-shooting Install

If you encounter errors during install that mention `gyp`, that refers to a Node.js native addon build tool that is required for some modules. Follow the instructions on the [gyp github repo](https://github.com/nodejs/node-gyp#installation) for installation and setting up required dependencies (eg Python and certain build tools like XCode Command Line Tools for OS X).

#### Running the React App

Since the frontend is a static site that just connects to an API for data requests, most frontend development happens independently of server-side changes. If you're only changing client-side behavior, you only need to run the React App. The simplest way to do this is to connect the frontend to the test website server. First, copy `frontend/.env.example` into `frontend/.env.development`. This file is already set up to point to the test website server.

To start a local development server, switch to the `frontend/` directory and run:
```bash
npm run start:development
```

The site should now be visible at `http://localhost:3000`. Any changes to source code will cause a live reload of the site.

Note: you can also run `npm start` without a `.env.development` file. This will read environment variables from your terminal.

Note: when new environment variables are added, be sure to update the `.env.example` file so developers can reference it for their own `.env.development` files.

#### Available Overrides for local development

Environment variables in `frontend/.env.development` can be tweaked as needed for local development.

The `REACT_APP_BASE_API_URL` can be changed for different setups:
- You can deploy the frontend server to your own GCP project
- You can run the frontend server locally (see below)
- You can run Docker locally (see below)
- You can set it to an empty string or remove it to make the frontend read files from the `/public/tmp` directory. This allows testing behavior by simply dropping local files into that directory.

You can also force specific dataset files to read from the `/public/tmp` directory by setting an environment variable with the name `REACT_APP_FORCE_STATIC` variable to a comma-separated list of filenames. For example, `REACT_APP_FORCE_STATIC=my_file1.json,my_file2.json` would force `my_file1.json` and `my_file2.json` to be served from `/public/tmp` even if `REACT_APP_BASE_API_URL` is set to a real server url.

### Running the Frontend Server locally

If you need to run the frontend server locally to test server-side changes, copy `frontend_server/.env.example` into `frontend_server/.env.development`, and update `DATA_SERVER_URL` to point to a specific data server url, similar to above.

To run the frontend server locally, navigate to the `frontend_server/` directory and run:
```bash
node -r dotenv/config server.js dotenv_config_path=.env.development
```

This will start the server at `http://localhost:8080`. However, since it mostly serves static files from the `build/` directory, you will either need to
1. run the frontend server separately and set the `REACT_APP_BASE_API_URL` url to `http://localhost:8080` (see above), or
2. go to the `frontend/` directory and run `npm run build:development`. Then copy the `frontend/build/` directory to `frontend_server/build/`

Similarly to the frontend React app, the frontend server can be configured for local development by changing environment variables in `frontend_server/.env.development`. Copy `frontend_server/.env.example` to get started.

#### Running the Frontend Server with Docker locally

If you need to test Dockerfile changes or run the frontend in a way that more closely mirrors the production environment, you can run it using Docker. This will build both the frontend React app and the frontend server.

Run the following commands from the root project directory:
1. Build the frontend Docker image:
   `docker build -t <some-identifying-tag> -f frontend_server/Dockerfile . --build-arg="DEPLOY_CONTEXT=development"`
2. Run the frontend Docker image:
   `docker run -p 49160:8080 -d <some-identifying-tag>`
3. Navigate to `http://localhost:49160`.

When building with Docker, changes will not automatically be applied; you will need to rebuild the Docker image.

#### Running the Frontend Sever in your own GCP project

Refer to [Deploying your own instance with terraform](#Deploying-your-own-instance-with-terraform) for instructions on deploying the frontend server to your own GCP project.

### Running Storybook locally

To run storybook locally, switch to the `frontend/` directory and run:
```bash
npm run storybook:development
```

Storybook local development also uses `frontend/.env.development` for configuration. However, storybook environment variables must start with `STORYBOOK_` instead of `REACT_APP_`. Most environment variables have an equivalent `STORYBOOK_` version.

### Tests

To run unit tests, switch to the `frontend/` directory and run:
```bash
npm test
```

This will run tests in watch mode, so you may have the tests running while developing.

### Build

To create a "production" build do:

```bash
npm run build:${DEPLOY_CONTEXT}
```

This will use the `frontend/.env.${DEPLOY_CONTEXT}` file for environment variables and outputs bundled files in the `frontend/build/` directory. These are the files that are used for hosting the app in production environments.

### Ejecting Create React App

_Note: this is a one-way operation. Once you `eject`, you can’t go back!_

Don't do this unless there's a strong need to. See https://create-react-app.dev/docs/available-scripts/#npm-run-eject for further information.


# Backend

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

Before deploying, make sure you have installed Terraform and a Docker client (e.g. Docker Desktop). See [Set up](#Set-up) above.

* Edit the `config/example.tfvars` file and rename it to `config/terraform.tfvars`

* Login to glcoud

```bash
gcloud auth application-default login
```

* Login to docker

```bash
gcloud auth configure-docker
```

* Build and push docker images

```bash
./scripts/push_images
```

* Setup your cloud environment with `terraform`

```bash
pushd config
  terraform apply --var-file digest.tfvars
popd
```

* Configure the airflow server

```bash
pushd airflow
  ./upload-dags.sh
  ./update-environment-variables.sh
popd
```

## To test changes to python code:

* Build and push docker images

```bash
./scripts/push_images
```

* Setup your cloud environment with `terraform`

```bash
pushd config
  terraform apply --var-file digest.tfvars
popd
```

6. To redeploy, e.g. after making changes to a Cloud Run service, repeat steps 4-5. Make sure you run the docker commands from your base project dir and the terraform commands from the `config/` directory.

### Terraform deployment notes

Terraform doesn't automatically diff the contents of cloud run services, so simply calling `terraform apply` after making code changes won't upload your new changes. This is why Steps 4 and 5 are needed above. Here is an alternative:

Use [`terraform taint`](https://www.terraform.io/docs/commands/taint.html) to mark a resource as requiring redeploy. Eg `terraform taint google_cloud_run_service.ingestion_service`.
You can then set the `ingestion_image_name` variable in your tfvars file to `<your-ingestion-image-name>` and `gcs_to_bq_image_name` to `<your-gcs-to-bq-image-name>`. Then replace Step 5 above with just `terraform apply`. Step 4 is still required.

## Accessing the Terraform UI Deployed
1. Go to [Cloud Console](console.cloud.google.com).

2. Search for Composer

3. A list of environments should be present.  Look for data-ingestion-environment

4. Click into the details, and navigate to the environment configuration tab.

5. One of the properties listed is Airflow web UI link.

## Test and Production Environments

### A note on Airflow DAGS

All files in the airflows/dags directory will be uploaded to the test airflow environment. Please only put DAG files in this directory.

# License

[MIT](./LICENSE)
