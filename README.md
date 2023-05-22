# Health Equity Tracker

Codebase for the [Health Equity Tracker](https://healthequitytracker.org/), Satcher Health Leadership Institute, Morehouse School of Medicine.

> Prompted by the COVID-19 pandemic, the Health Equity Tracker was created in 2020 to aggregate up-to-date demographic data from the hardest-hit communities. The Health Equity Tracker aims to give a detailed view of health outcomes by race, ethnicity, sex, socioeconomic status, and other critical factors. Our hope is that it will help policymakers understand what resources and support affected communities need to be able to improve their outcomes.

[![Check Outgoing Links](https://github.com/SatcherInstitute/health-equity-tracker/actions/workflows/urlsScheduled.yml/badge.svg)](https://github.com/SatcherInstitute/health-equity-tracker/actions/workflows/urlsScheduled.yml)
[![GitHub Super-Linter](https://github.com/SatcherInstitute/health-equity-tracker/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)

## Contributing

1. [Fork the repository on github](https://docs.github.com/en/free-pro-team@latest/github/getting-started-with-github/fork-a-repo)
2. On your development machine, clone your forked repo and add the official repo as a remote.
    - Tip: our development team keeps the remote name `origin` for the original repo, and uses a different name for our forked remote like `josh`, `ben`, or `eric`.
    - To add a remote branch (replacing with your desired remote name and actual remote URL) `git remote add ben https://github.com/benhammondmusic/health-equity-tracker`


Read more about the forking workflow [here](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow).

<details>
<summary>Note that there are a few downsides to "Squash and merge":</summary>

- The official repo will not show commits from collaborators if the PR is a collaborative branch.
- Working off the same branch or a dependent branch duplicates commits on the dependent branch and can cause repeated merge conflicts. To work around this, if you have a PR `my_branch_1` and you want to start work on a new PR that is dependent on `my_branch_1`, you can do the following:
  1. Create a new local branch `my_branch_2` based on `my_branch_1`. Continue to develop on `my_branch_2`.
  2. If `my_branch_1` is updated (including by merging changes from main), switch to `my_branch_2` and run `git rebase -i my_branch_1` to incorporate the changes into `my_branch_2` while maintaining the the branch dependency.
  3. When review is done, squash and merge `my_branch_1`. Don't delete `my_branch_1`yet.
  4. From local client, go to main branch and pull from main to update the local main branch with the squashed change.
  5. From local client, run `git rebase --onto main my_branch_1 my_branch_2`. This tells git to move all the commits between `my_branch_1` and `my_branch_2` onto main. You can now delete `my_branch_1`.

 For details on "Squash and merge" see [here](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/about-merge-methods-on-github#squashing-your-merge-commits)

</details>




# Frontend

The frontend consists of
1. `health-equity-tracker/frontend/`: A React app that contains all code and static resources needed in the browser (html, TS, CSS, images). This app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and later migrated to Vite.
2. `health-equity-tracker/frontend_server/`: A lightweight server that serves the React app as static files and forwards data requests to the data server.
3. `health-equity-tracker/data_server/`: A data server that responds to data requests by serving data files that have been exported from the data pipeline.


## To confirm and stage changes to `/frontend`:

1. Complete all one-time configurations needed (instructions further down)
2. Pull the latest changes from the official repo
    - Tip: If your official remote is named `origin`, run `git pull origin main`
3. Create a local branch, make changes, and commit to your local branch. Repeat until changes are ready for review
4. Push your branch to your remote fork, use the github UI to open a pull request (PR), and add reviewer(s).<details><summary>More</summary> `git push ben -u new-feature-branch` (`-u` sets the remote as it's default upstream, so for future pushes on this branch you can just use `git push`). A preview link is generated automatically by Netlify and posted to the PR comments</details>
5. Push additional commits to your remote forked branch as you respond to reviewer comments
6. When ready to merge to `main`, use the "Squash and merge" option. <details><summary>More</summary> (found under the submit button dropdown options). This maintains linear history and ensures your entire PR is merged as a single commit, while being simple to use in most cases. If there are conflicts, pull the latest changes from main, merge them into your PR, and try again.</details>
7. Once your branch is merged, you can delete it from your forked repo using the suggestion on the GitHub UI, and also from your local repo
8.  Preview the updated `main` branch code at dev.healthequitytracker.org before cutting a release to production

## Frontend React App Environments

The frontend React App runs in different environments. We use configuration files (`frontend/.env.prod`, `frontend/.env.staging`, etc) to control settings in different environments. These include things like the data server URL and logging settings. These can be overridden for local development using a `frontend/.env.development` file.

### Running just the React App locally

#### One Time Setup

Switch to the `frontend/` directory, then install dependencies using NPM.

_Note: you will need a compatible version of Node.JS and NPM installed locally; see the "engines" field in `frontend/package.json` for the required  of each. It's recommended to use [Node Version Manager (`nvm`)](https://github.com/nvm-sh/nvm) if you need to have multiple versions of Node.JS / NPM installed on your machine, though members have also had success with Homebrew._

```bash
cd frontend && npm install
```

#### Trouble-shooting Install

<details><summary>gyp error</summary>If you encounter an error regarding `gyp`, that refers to a Node.js native addon build tool that is required for some modules. Follow the instructions on the [gyp github repo](https://github.com/nodejs/node-gyp#installation) for installation and setting up required dependencies (eg Python and certain build tools like XCode Command Line Tools for OS X).</details>

#### Running the React App

Since the frontend is a static site that just connects to an API for data requests, most frontend development happens independently of server-side changes. If you're only changing client-side behavior, you only need to run the React App. The simplest way to do this is to connect the frontend to the test website server. First, copy `frontend/.env.example` into `frontend/.env.development`. This file is already set up to point to the test website server.

To start a local development server, switch to the `frontend/` directory and run:
```bash
npm run dev
```

The site should now be visible at `http://localhost:3000`. Any changes to source code will cause a live reload of the site.

Note: when new, non-secret environment variables are added, be sure to update the `.env.example` file so developers can reference it for their own `.env.development` files.

#### Available Overrides for local development

You can force specific dataset files to read from the `/public/tmp` directory by setting an environment variable with the name `VITE_FORCE_STATIC` variable to a comma-separated list of filenames. For example, `VITE_FORCE_STATIC=my_file1.json,my_file2.json` would force `my_file1.json` and `my_file2.json` to be served from `/public/tmp` even if `VITE_BASE_API_URL` is set to a real server url.

<details>
<summary>Environment variables can also be tweaked for local development:</summary>
The `VITE_BASE_API_URL` can be changed for different setups:
- You can deploy the frontend server to your own GCP project
- You can run the frontend server locally (see below)
- You can run Docker locally (see below)
- You can set it to an empty string or remove it to make the frontend read files from the `/public/tmp` directory. This allows testing behavior by simply dropping local files into that directory.
</details>


### Frontend Automated Testing

#### Unit Tests (Vitest)
To run unit tests, switch to the `frontend/` directory and run:
```bash
npm run test:watch
```

This will run tests in watch mode, automatically running tests against changes to your code.

#### End To End (E22) Tests (Playwright)

To run e2e tests, switch to the `frontend/` directory and run:
```bash
npm run e2e
```

This will use Playwright test runner to launch the React app if needed, and then confirm routing/rendering is working as expected. These tests are run on GitHub pull request commits.

#### Outgoing Links Tests

To run url tests, switch to the `frontend/` directory and run:
```bash
npm run url
```

This will use Playwright test runner to launch the React app if needed, and then confirm all outgoing links are returning successful responses. This runs weekly on GitHub.


### Building / Bundling for Production

Note: Building manually is not required for development, but helpful for debugging deployment issues as this step is run during CI. To create a "production" build do:

```bash
npm run build:${DEPLOY_CONTEXT}
```

This will use the `frontend/.env.${DEPLOY_CONTEXT}` file for environment variables and outputs bundled files in the `frontend/build/` directory. These are the files that are used for hosting the app in production environments.


# Backend

The backend consists of
- `health-equity-tracker/aggregator/`: DEPRECATED: Code for the microservice previously responsible for running SQL merges of Census data
- `health-equity-tracker/airflow/`: Code that controls the DAGs which orchestrate the execution of these various microservices
- `health-equity-tracker/config/`: Terraform configuration for setting permissions and provisioning needed resources for cloud computing
- `health-equity-tracker/data/`: In code-base "bucket" used to store manually downloaded data from outside sources where it isn't possible to fetch new data directly via and API endpoint or linkable file URL
- `health-equity-tracker/e2e_tests/`: Automated tests ensuring all services work together as expected; not to be confused with the Playwright E2E tests found in `/frontend`
- `health-equity-tracker/exporter/`: Code for the microservice responsible for taking HET-style data from HET BigQuery tables and storing them in buckets as .json files. NOTE: County-level files are broken up by state when exporting.
- `health-equity-tracker/python/`: Code for the Python modules responsible for fetching data from outside sources and wrangling into a HET-style table with rows for every combination of demographic group, geographic area, and optionally time period, and columns for each measured metric
- `health-equity-tracker/requirements/`: Packages required for the HET
- `health-equity-tracker/run_gcs_to_bq/`: Code for the microservice responsible for running datasource specific modules found in `/python` and ultimately exporting the produced dataframes to BigQuery
- `health-equity-tracker/run_ingestion/`: (PARTIALLY USED) Code for the microservice responsible for caching datasource data into GCP buckets, for later use by the `run_gcs_to_bq` operator. This service is only used by some of our older data sources, like `acs_population`, but often for newer datasources we simply load data directly from the `run_gcs_to_bq` microservice

## Python environment setup

1. (One-time) Create a virtual environment in your project directory, for example: `python3 -m venv .venv`
2. (Every time you develop on Python code) Activate the venv (every time you want to update Python ): `source .venv/bin/activate`
3. (One-time) Install pip-tools and other packages as needed: `pip install pip-tools`


## To confirm and stage changes to `/python`, `/airflow/dags`, or other backend code:

1. Follow the rest of the instructions below these steps for one-time configurations needed.
2. Pull the latest changes from the official repo.
    - Tip: If your official remote is named `origin`, run `git pull origin main`
3. Create a local branch, make changes, and commit to your local branch. Repeat until changes are ready for review.
4. From your local directory floor, change branches to the backend feature branch you want to test.
5. Run `git push origin HEAD:infra-test -f` which will force push an exact copy of your local feature branch to the HET origin (not your fork) `infra-test` branch.
6. This will trigger a build and deployment of backend images to the HET Infra TEST GCP project using the new backend code (and will also build and deploy the frontend the dev site using the frontend code from the `main` branch)
7. Once the `deployBackendToInfraTest` GitHub action completes successfully (ignoring the `(infra-test) Terraform / Airflow Configs Process completed with exit code 1.` that unintentionally appears in the Annotations section), navigate to the test GCP project
8. Navigate to Composer > Airflow and trigger the DAG that corresponds to your updated backend code
9.  Once DAG completes successfully, you should be able to view the updated data pipeline output in the test GCP project's BigQuery tables and also the exported .json files found in the GCP Buckets.
10. Push your branch to your remote fork, use the github UI to open a pull request (PR), and add reviewer(s).
11. When ready to merge, use the "Squash and merge" option
12. **Ensure all affected pipelines are run after both merging to `main` and after cutting a release to production**.

Note: Pipeline updates should be non-breaking, ideally pushing additional data to the production codebase, followed by pushing updated frontend changes to ingest the new pipeline data, finally followed by removal of the older, now-unused data.

Note: All files in the airflows/dags directory will be uploaded to the test airflow environment. Please only put DAG files in this directory.





## Python Unit Testing

Unit tests run using pytest, which will recursively look for and execute test files (which contain the string `test` in the file name).

To install, ensure your venv is activated, and run: `pip install pytest`

To run pytest against your entire, updated backend code:
```bash
pip install python/data_server/ python/datasources/ python/ingestion/ && pytest python/tests/
```

To run single test file follow this pattern (the `-s` flag enables `print()` statements to log even on passing tests):
```bash
pip install python/datasources/ && pytest python/tests/datasources/test_cdc_hiv.py -s
```


# HET Microservice Architecture
![HET Microservice Architecture Diagram](https://raw.githubusercontent.com/SatcherInstitute/health-equity-tracker/9325c032d8df110fc234f0ecd75c54129282418f/HET%20Architecture.svg)


# Developing Your Own Tracker

Much of the guidance in this readme is aimed towards ongoing development of the platform available at healthequitytracker.org, however we highly encourage interested parties to leverage this open-sourced code base and the data access it provides to advance health equity in their own research and communities.

The following section is not required for regular maintenance of the Health Equity Tracker, but can be extremely helpful for local development and cloud deployment of similar, forked projects.

<details><summary>Expand advanced configuration details</summary>


## Advanced Frontend Configuration


### Running the Frontend Server locally


#### If you need to run the frontend server locally to test server-side changes:

Copy `frontend_server/.env.example` into `frontend_server/.env.development`, and update `DATA_SERVER_URL` to point to a specific data server url, similar to above.

To run the frontend server locally, navigate to the `frontend_server/` directory and run:
```bash
node -r dotenv/config server.js dotenv_config_path=.env.development
```

This will start the server at `http://localhost:8080`. However, since it mostly serves static files from the `build/` directory, you will either need to
1. run the frontend server separately and set the `VITE_BASE_API_URL` url to `http://localhost:8080` (see above), or
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

#### Running the Frontend Server in your own GCP project

Refer to [Deploying your own instance with terraform](#Deploying-your-own-instance-with-terraform) for instructions on deploying the frontend server to your own GCP project.



## Advanced Backend Configuration

### Testing Pub/Sub triggers

To test a Cloud Run service triggered by a Pub/Sub topic, run
`gcloud pubsub topics publish projects/<project-id>/topics/<your_topic_name> --message "your_message" --attribute=KEY1=VAL1,KEY2=VAL2`

See [Documentation](https://cloud.google.com/sdk/gcloud/reference/pubsub/topics/publish) for details.


### Updating Shared python code


Most python code should go in the `/python` directory, which contains packages that can be installed into any service. Each sub-directory of `/python` is a package with an `__init__.py` file, a `setup.py` file, and a `requirements.in` file. Shared code should go in one of these packages. If a new sub-package is added:

1. Create a folder `/python/<new_package>`. Inside, add:

   - An empty `__init__.py` file
   - A `setup.py` file with options: `name=<new_package>`, `package_dir={'<new_package>': ''}`, and `packages=['<new_package>']`
   - A `requirements.in` file with the necessary dependencies

2. For each service that depends on `/python/<new_package>`, follow instructions at [Adding an internal dependency](#adding-an-internal-dependency)

To work with the code locally, run `pip install ./python/<package>` from the root project directory. If your IDE complains about imports after changing code in `/python`, re-run `pip install ./python/<package>`.



### Adding a new root-level python directory

Note: generally this should only be done for a new service. Otherwise, please add python code to the `python/` directory.

When adding a new python root-level python directory, be sure to update `.github/workflows/linter.yml` to ensure the directory is linted and type-checked.

### Adding python dependencies

#### Adding an external dependency

1. Add the dependency to the appropriate `requirements.in` file.
   - If the dependency is used by `/python/<package>`, add it to the `/python/<package>/requirements.in` file.
   - If the dependency is used directly by a service, add it to the `<service_directory>/requirements.in` file.

1. For each service that needs the dependency (for deps in `/python/<package>` this means every service that depends on `/python/<package>`):
   - Run `cd <service_directory>`, then `pip-compile requirements.in` where `<service_directory>` is the root-level directory for the service. This will generate a `requirements.txt` file.
   - Run `pip install -r requirements.txt` to ensure your local environment has the dependencies, or run `pip install <new_dep>` directly. Note, you'll first need to have followed the python environment setup described above [Python environment setup](#python-environment-setup).

1. Update the requirements.txt for unit tests
`pip-compile python/tests/requirements.in -o python/tests/requirements.txt`

#### Adding an internal dependency

If a service adds a dependency on `/python/<some_package>`:

- Add `-r ../python/<some_package>/requirements.in` to the `<service_directory>/requirements.in` file. This will ensure that any deps needed for the package get installed for the service.
- Follow step 2 of [Adding an external dependency](#adding-an-external-dependency) to generate the relevant `requirements.txt` files.
- Add the line `RUN pip install ./python/<some_package>` to `<service_directory>/Dockerfile`


### Building images locally and deploying to personal GCP projects for development


#### UNUSED One-time development setup

Install Cloud SDK ([Quickstart](https://cloud.google.com/sdk/docs/quickstart))
Install Terraform ([Getting started](https://learn.hashicorp.com/tutorials/terraform/install-cli?in=terraform/gcp-get-started))
Install Docker Desktop ([Get Docker](https://docs.docker.com/get-docker/))

`gcloud config set project <project-id>`


### Launch the data ingestion pipeline on your local machine

#### Set up

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

#### Getting Started

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

#### Airflow UI link

- [localhost:8080](http://localhost:8080/)

### Developing locally with BigQuery

To upload to BigQuery from your local development environment, use [these setup directions](https://cloud.google.com/bigquery/docs/quickstarts/quickstart-client-libraries) with an experimental Cloud project. This may be useful when iterating quickly if your Cloud Run ingestion job isn’t able to upload to BigQuery for some reason such as JSON parsing errors.

### Deploying your own instance with terraform

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

### To test changes to python code:

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

#### Terraform deployment notes

Terraform doesn't automatically diff the contents of cloud run services, so simply calling `terraform apply` after making code changes won't upload your new changes. This is why Steps 4 and 5 are needed above. Here is an alternative:

Use [`terraform taint`](https://www.terraform.io/docs/commands/taint.html) to mark a resource as requiring redeploy. Eg `terraform taint google_cloud_run_service.ingestion_service`.
You can then set the `ingestion_image_name` variable in your tfvars file to `<your-ingestion-image-name>` and `gcs_to_bq_image_name` to `<your-gcs-to-bq-image-name>`. Then replace Step 5 above with just `terraform apply`. Step 4 is still required.

### Accessing the Terraform UI Deployed
1. Go to [Cloud Console](console.cloud.google.com).

2. Search for Composer

3. A list of environments should be present.  Look for data-ingestion-environment

4. Click into the details, and navigate to the environment configuration tab.

5. One of the properties listed is Airflow web UI link.




</details>



# License

[MIT](./LICENSE)
