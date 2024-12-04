# Health Equity Tracker

Codebase for the [Health Equity Tracker](https://healthequitytracker.org/), Satcher Health Leadership Institute, Morehouse School of Medicine

> Prompted by the COVID-19 pandemic, the Health Equity Tracker was created in 2020 to aggregate up-to-date demographic data from the hardest-hit communities. The Health Equity Tracker aims to give a detailed view of health outcomes by race, ethnicity, sex, socioeconomic status, and other critical factors. Our hope is that it will help policymakers understand what resources and support affected communities need to be able to improve their outcomes.

[![Run Playwright E2E Nightly Against PROD](https://github.com/SatcherInstitute/health-equity-tracker/actions/workflows/e2eScheduled.yml/badge.svg)](https://github.com/SatcherInstitute/health-equity-tracker/actions/workflows/e2eScheduled.yml)
[![Check Outgoing Links](https://github.com/SatcherInstitute/health-equity-tracker/actions/workflows/cronUrlChecker.yml/badge.svg)](https://github.com/SatcherInstitute/health-equity-tracker/actions/workflows/cronUrlChecker.yml)
[![GitHub Super-Linter](https://github.com/SatcherInstitute/health-equity-tracker/workflows/runSuperLinter.yml/badge.svg)](https://github.com/marketplace/actions/super-linter)

## Frontend Quick-Start

### Setting Up Your Git and GitHub

1. In your browser, create a fork of the Health Equity Tracker repo: <https://github.com/SatcherInstitute/health-equity-tracker/fork>

2. In your terminal, clone your new forked repo down to your local development machine (replace placeholder with your github username):

   ```bash
   git clone https://github.com/<your-github-username>/health-equity-tracker.git
   ```

3. Set the original repo to be "origin":

   ```bash
   git remote set-url origin https://github.com/SatcherInstitute/health-equity-tracker.git
   ```

4. Set your forked repo to a memorable remote name:

   ```bash
   git remote add <your-remote-name> <your-forked-git-url>
   ```

   For example, Ben would do `git remote add ben https://github.com/benhammondmusic/health-equity-tracker.git`

5. Confirm your remote and origin are set up as expected:

   ```bash
   git remote -v
   ```

   Example output for Ben:

   ```txt
   ben   https://github.com/benhammondmusic/health-equity-tracker.git (fetch)
   ben   https://github.com/benhammondmusic/health-equity-tracker.git (push)
   origin   https://github.com/SatcherInstitute/health-equity-tracker.git (fetch)
   origin   https://github.com/SatcherInstitute/health-equity-tracker.git (push)
   ```

### Install Node and Pre-Commit

Our repo requires Node, and is also configured to run helpful code linting, formatting, and error-checking automatically on every commit. On Mac, the easiest way is to first ensure you have [Homebrew installed](https://brew.sh/), and then use that to install [pre-commit](https://pre-commit.com/#installation). If you don't already have it installed, you can also install Node via Homebrew as well.

```bash
brew install pre-commit
```

After it installs successfully, you need to use it to install the HET pre-commit hooks within your local .git

```bash
pre-commit install
```

Note: If you have existing git hooks (like from Husky) you need to force install:
`pre-commit install -f`

### Install Pre-Commit on Windows

<details>
   <summary>
   On machines without Homebrew you can use Python to install pre-commit:
   </summary>

1. Install Python: Make sure Python is installed on your system. You can download and install Python from the official website: <https://www.python.org/downloads/>.

1. Install pre-commit package: Open the command prompt and run the following command to install the pre-commit package using pip:

   `pip install pre-commit`

1. Add Python Scripts directory to PATH: If Python Scripts directory is not added to your PATH environment variable, you need to add it. The Python Scripts directory is usually located at `C:\Python<version>\Scripts`. You can add it to your PATH by following these steps:
   - Right-click on "This PC" or "My Computer" and select "Properties".
   - Click on "Advanced system settings" on the left side.
   - In the System Properties window, click on the "Environment Variables" button.
   - In the Environment Variables window, under "System variables", select the "Path" variable and click on "Edit".
   - Click on "New" and add the path to the Python Scripts directory (e.g., `C:\Python<version>\Scripts`).
   - Click "OK" on all windows to save the changes.

1. Verify installation: To verify that pre-commit is installed correctly, you can run the following command:

   `pre-commit --version`

   This should display the version of pre-commit installed on your system. Now pre-commit should be installed system-wide on your Windows machine.

1. Run pre-commit install to set up the git hook scripts:

   `pre-commit install`.

   Your output should look something like this:

   `pre-commit installed at .git/hooks/pre-commit`

</details>

### Setting Up the Frontend Locally (One Time Setup)

1. In your terminal, change into the health-equity-tracker frontend directory: `cd health-equity-tracker/frontend`

2. Duplicate the example environmental variables file into a new, automatically git-ignored local development file:

   ```bash
   cp -i .env.example .env.development
   ```

3. Install the node modules:

   ```bash
   npm i
   ```

Note: If you are using VSCode, ensure you install the recommended extensions including Biome, which we use for linting and formatting JavaScript-based files.

### Running the Frontend Locally on a Development Server (localhost)

1. While still in the `health-equity-tracker/frontend/` folder, run

   ```bash
   npm run dev
   ```

2. In your browser, visit <http://localhost:3000>

## Running Frontend Tests Locally

### Unit Tests with Vitest

- To run once: `npm run test`
- To run in watch mode, so saved changes to the codebase will trigger reruns of affected tests:

  ```bash
  npm run test:watch
  ```

### End to End (E2E) Tests with Playwright

#### Full test of "Nightly" E2E tests ensuring app UI works as expected

- These tests automatically run:
  - against the dynamic Netlify deploy link on all PR updates
  - against the <dev.healthequitytracker.org> staging site on PR merges to `main`
  - against the <healthequitytracker.org> production site every night
- To manually run full suite of tests locally (ensure the localhost server is still running first): `npm run e2e`
- To run subsets of the full test suite locally, just add the filename (without the path) or even a portion of a work after the command:
  - `npm run e2e statins.nightly.spec.ts` runs the single file
  - `npm run e2e hiv` runs all tests that include the string `hiv` in the filename
- To run the tests locally, but target either the production or staging deployments instead of localhost: `npm run e2e-prod` and `npm run e2e-staging` respectivally. Target specific test files the same way described above.

## Making a Pull Request (PR)

1. Ensure you assign yourself to the [issue(s)](https://github.com/SatcherInstitute/health-equity-tracker/issues?q=is%3Aissue+is%3Aopen) that this PR will address. Create one if it doesn't exist, assigning the correct Milestones if needed.

2. Ensure your local main branch is up to date with the origin main branch:

   ```bash
   git pull origin main
   ```

3. Ensure your forked repo's main branch is up to date:

   - first time to set the upstream for the main branch

     ```bash
     git push -u <your-remote-name> main
     ```

   - ongoing, simply `git push`

4. Create and switch to a local feature branch from main:

   ```bash
   git checkout -b <new-feature-branch-name>
   ```

   (we don't follow any particular conventions here or in commit messages, just make it easy to type and relevant)

5. Continuously ensure the branch is up to date with the origin main branch which is often updated several times a day:

   ```bash
   git pull origin main
   ```

6. If you encounter merge conflicts, resolve them. Ben likes VSCode's new conflict resolution split screen feature, and also prefers setting VSCode as the default message editor rather than VIM: `git config --global core.editor "code --wait"`

7. Make changes to the code base, save the files, add those changes to staging:

   ```bash
   git add -p`# yes/no your way through the chunks of changes
   ```

8. Commit those changes when you're ready:

   ```bash
   git commit -m "adds new stuff"
   ```

9. Ensure the pre-commit checks pass. If not, make the fixes as required by the linters and type-checker, etc., and run the same commit command again (hit ⬆ key to cycle through your previously run terminal commands)

10. Push to your forked remote:

    - First time:

      ```bash
      git push -u <your-remote-name> <new-feature-branch-name>
      ```

    - Ongoing code changes: `git push`

11. CMD+Click (CTRL+Click for Windows) on the URL under this line in the logged message: `Create a pull request for 'new-feature-branch-name' on GitHub by visiting:` to launch the web UI for your new pull request

12. In the browser with the new PR open, edit the title to make it a meaningful description of what the PR actively does to the code.

13. Please fill in the templated sections as relevant, especially triggering auto-completion of issues if true using `closes #1234` or `fixes #1234` somewhere in the description text of the PR.

14. A preview link is generated automatically by Netlify and posted to the PR comments; check it out to manually confirm changes appeared to the frontend as you expected.

15. When ready, request a review. If you are unable to request a review, your username may need permissions first; please reach out to a team member.

16. Once your PR is approved (and you've ensured CI tests have passed), you can "Squash and Merge" your PR. Once complete, feel free to delete the branch from your remote fork (using the purple button).

17. Switch back to main:

    ```bash
    git switch main
    ```

18. Delete the feature branch

    ```bash
    git branch -D <new-feature-branch-name>
    ```

19. Pull those new updates from origin main into your local main:

    ```bash
    git pull origin main
    ```

20. Push those new updates to your remote main:

    ```bash
    git push
    ```

## YOU'RE DONE WITH SETUP 🥳

Everything below is more detailed, advanced info that you probably won't need right away. Congratulations!!

<img src="https://healthequitytracker.org/img/graphics/het-share.png" width=300 alt="Computer displaying the health equity tracker comparison maps" />

## Frontend (Advanced)

The frontend consists of

1. `health-equity-tracker/frontend/`: A React app that contains all code and static resources needed in the browser (html, TS, CSS, images). This app was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and later migrated to Vite.
2. `health-equity-tracker/frontend_server/`: A lightweight server that serves the React app as static files and forwards data requests to the data server.

3. `health-equity-tracker/data_server/`: A data server that responds to data requests by serving data files that have been exported from the data pipeline.

### Available Overrides for local development

You can force specific dataset files to read from the `/public/tmp` directory by setting an environment variable with the name `VITE_FORCE_STATIC` variable to a comma-separated list of filenames. For example, `VITE_FORCE_STATIC=my_file1.json,my_file2.json` would force `my_file1.json` and `my_file2.json` to be served from `/public/tmp` even if `VITE_BASE_API_URL` is set to a real server url.

### Environment variables can also be tweaked for local development

The `VITE_BASE_API_URL` can be changed for different setups:

- You can deploy the frontend server to your own GCP project
- You can run the frontend server locally (see below)
- You can run Docker locally (see below)
- You can set it to an empty string or remove it to make the frontend read files from the `/public/tmp` directory. This allows testing behavior by simply dropping local files into that directory.

### Building / Bundling for Production

Note: Building manually is not required for development, but helpful for debugging deployment issues as this step is run during CI. To create a "production" development build do: `npm run preview`. For more finetuned control, run `npm run build:${DEPLOY_CONTEXT}` This will use the `frontend/.env.${DEPLOY_CONTEXT}` file for environment variables and outputs bundled files in the `frontend/build/` directory. These are the files that are used for hosting the app in production environments.

## Backend

The backend consists of:

- `health-equity-tracker/airflow/`: Code that controls the DAGs which orchestrate the execution of these various microservices
- `health-equity-tracker/config/`: Terraform configuration for setting permissions and provisioning needed resources for cloud computing
- `health-equity-tracker/data/`: In code-base "bucket" used to store manually downloaded data from outside sources where it isn't possible to fetch new data directly via and API endpoint or linkable file URL
- `health-equity-tracker/e2e_tests/`: Automated tests ensuring all services work together as expected; not to be confused with the Playwright E2E tests found in `/frontend`
- `health-equity-tracker/exporter/`: Code for the microservice responsible for taking HET-style data from HET BigQuery tables and storing them in buckets as .json files. NOTE: County-level files are broken up by state when exporting.
- `health-equity-tracker/python/`: Code for the Python modules responsible for fetching data from outside sources and wrangling into a HET-style table with rows for every combination of demographic group, geographic area, and optionally time period, and columns for each measured metric
- `health-equity-tracker/requirements/`: Packages required for the HET
- `health-equity-tracker/run_gcs_to_bq/`: Code for the microservice responsible for running datasource specific modules found in `/python` and ultimately exporting the produced dataframes to BigQuery
- `health-equity-tracker/run_ingestion/`: (PARTIALLY USED) Code for the microservice responsible for caching datasource data into GCP buckets, for later use by the `run_gcs_to_bq` operator. This service is only used by some of our older data sources, like `acs_population`, but often for newer datasources we simply load data directly from the `run_gcs_to_bq` microservice
- `health-equity-tracker/aggregator/`: DEPRECATED: Code for the microservice previously responsible for running SQL merges of Census data

### Python environment setup

1. (One-time) Ensure you have the right version of Python installed (as found in pyproject.toml). You can install the correct version using Homebrew (on Mac) with `brew install python@3.12`
1. (One-time) Create a virtual environment in your project directory, for example: `python3 -m venv .venv`
1. (Every time you develop on Python code) Activate the venv (every time you want to update Python ): `source .venv/bin/activate`
1. (One-time) Install pip-tools and other packages as needed: `pip install pip-tools`
1. (One-time) Install all dependencies across all Python services on your local machine: `./install-all-python.sh`

Note: If you are using VSCode, ensure you install the recommend extensions, including Black which is used for linting/formatting.

### To confirm and stage changes to `/python`, `/airflow/dags`, or other backend code

1. Follow the rest of the instructions below these steps for one-time configurations needed.
2. Pull the latest changes from the official repo.
   - Tip: If your official remote is named `origin`, run `git pull origin main`
3. Create a local branch, make changes, and commit to your local branch. Repeat until changes are ready for review.
4. From your local directory floor, change branches to the backend feature branch you want to test.
5. Run `git push origin HEAD:infra-test -f` which will force push an exact copy of your local feature branch to the HET origin (not your fork) `infra-test` branch.
6. This will trigger a build and deployment of backend images to the HET Infra TEST GCP project using the new backend code (and will also build and deploy the frontend the dev site using the frontend code from the `main` branch)
7. Once the `deployBackendToInfraTest` GitHub action completes successfully (ignoring the `(infra-test) Terraform / Airflow Configs Process completed with exit code 1.` that unintentionally appears in the Annotations section), navigate to the test GCP project
   > Note: if you run this command again too quickly before the first run has completed, you might encounter `Error acquiring the state lock` and the run will fail. If you are SURE that this occurred because of your 2nd run being too soon after the 1st (and not because another team member is using `infra-test`) then you can manually go into the Google Cloud Storage bucket that holds the terraform state, find the file named `default.tflock` and delete it or less destructively rename by adding today's date to the file name.
8. Navigate to Composer > Airflow and trigger the DAG that corresponds to your updated backend code
9. Once DAG completes successfully, you should be able to view the updated data pipeline output in the test GCP project's BigQuery tables and also the exported .json files found in the GCP Buckets.
10. Push your branch to your remote fork, use the github UI to open a pull request (PR), and add reviewer(s).
11. When ready to merge, use the "Squash and merge" option
12. **Ensure all affected pipelines are run after both merging to `main` and after cutting a release to production**.

Note: Pipeline updates should be non-breaking, ideally pushing additional data to the production codebase, followed by pushing updated frontend changes to ingest the new pipeline data, finally followed by removal of the older, now-unused data.

Note: All files in the airflows/dags directory will be uploaded to the test airflow environment. Please only put DAG files in this directory.

### Python Unit Testing

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

## HET Microservice Architecture

![HET Microservice Architecture Diagram](https://raw.githubusercontent.com/SatcherInstitute/health-equity-tracker/9325c032d8df110fc234f0ecd75c54129282418f/HET%20Architecture.svg)

## Developing Your Own Tracker

Much of the guidance in this readme is aimed towards ongoing development of the platform available at healthequitytracker.org, however we highly encourage interested parties to leverage this open-sourced code base and the data access it provides to advance health equity in their own research and communities.

The following section is not required for regular maintenance of the Health Equity Tracker, but can be extremely helpful for local development and cloud deployment of similar, forked projects.

<details><summary>Expand advanced configuration details</summary>

## Advanced Frontend Configuration

### Running the Frontend Server locally

#### If you need to run the frontend server locally to test server-side changes

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

Refer to [Deploying your own instance with terraform](#deploying-your-own-instance-with-terraform) for instructions on deploying the frontend server to your own GCP project.

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

Before deploying, make sure you have installed Terraform and a Docker client (e.g. Docker Desktop). See [Set up](#set-up) above.

- Edit the `config/example.tfvars` file and rename it to `config/terraform.tfvars`

- Login to glcoud

```bash
gcloud auth application-default login
```

- Login to docker

```bash
gcloud auth configure-docker
```

- Build and push docker images

```bash
./scripts/push_images
```

- Setup your cloud environment with `terraform`

```bash
pushd config
  terraform apply --var-file digest.tfvars
popd
```

- Configure the airflow server

```bash
pushd airflow
  ./upload-dags.sh
  ./update-environment-variables.sh
popd
```

### To test changes to python code

- Build and push docker images

```bash
./scripts/push_images
```

- Setup your cloud environment with `terraform`

```bash
pushd config
  terraform apply --var-file digest.tfvars
popd
```

- To redeploy, e.g. after making changes to a Cloud Run service, repeat steps 4-5. Make sure you run the docker commands from your base project dir and the terraform commands from the `config/` directory.

#### Terraform deployment notes

Terraform doesn't automatically diff the contents of cloud run services, so simply calling `terraform apply` after making code changes won't upload your new changes. This is why Steps 4 and 5 are needed above. Here is an alternative:

Use [`terraform taint`](https://www.terraform.io/docs/commands/taint.html) to mark a resource as requiring redeploy. Eg `terraform taint google_cloud_run_service.ingestion_service`.
You can then set the `ingestion_image_name` variable in your tfvars file to `<your-ingestion-image-name>` and `gcs_to_bq_image_name` to `<your-gcs-to-bq-image-name>`. Then replace Step 5 above with just `terraform apply`. Step 4 is still required.

### Accessing the Terraform UI Deployed

1. Go to [Cloud Console](console.cloud.google.com).

2. Search for Composer

3. A list of environments should be present. Look for data-ingestion-environment

4. Click into the details, and navigate to the environment configuration tab.

5. One of the properties listed is Airflow web UI link.

</details>

## License

[MIT](./LICENSE)
