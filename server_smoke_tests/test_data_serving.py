import os
import pandas as pd
import requests  # type: ignore


def testServerHealth():
    service_url = os.environ.get("SERVICE_URL").strip('"')
    print(f"SERVICE_URL={service_url}")

    resp = requests.get(f"{service_url}/health", timeout=30)
    assert resp.status_code == 200
    assert resp.json().get("status") == "ok"


def testServerRootServesFrontend():
    service_url = os.environ.get("SERVICE_URL").strip('"')
    resp = requests.get(service_url, timeout=30)
    assert resp.status_code == 200
    assert b"<!doctype html>" in resp.content.lower() or b"<html" in resp.content.lower()


def testDataServingThroughServer():
    service_url = os.environ.get("SERVICE_URL").strip('"')
    dataset_url = f"{service_url}/dataset?name=acs_population-sex_state_current.json"
    print(f"Dataset URL={dataset_url}")

    frame = pd.DataFrame(pd.read_json(dataset_url, orient="values"))
    assert len(frame.index) == 156
    assert frame.columns.size == 5
    assert frame.columns[0] == "state_fips"
    assert frame.columns[1] == "state_name"
    assert frame.columns[2] == "sex"
    assert frame.columns[3] == "population"
    assert frame.columns[4] == "population_pct"
