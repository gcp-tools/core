
from fastapi.testclient import TestClient
import sys
import os
import json

# Add the src directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from main import app

client = TestClient(app)

def test_spec_endpoint():
    response = client.post("/spec", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Spec processed")

def test_plan_endpoint():
    response = client.post("/plan", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Plan generated")

def test_codegen_endpoint():
    response = client.post("/codegen", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Codegen artifact created")

def test_test_endpoint():
    response = client.post("/test", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Test artifact created")

def test_infra_endpoint():
    response = client.post("/infra", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Infra artifact created")

def test_review_endpoint():
    response = client.post("/review", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Review artifact created")

def test_ops_endpoint():
    response = client.post("/ops", json={"foo": "bar"})
    assert response.status_code == 200
    assert response.json()["result"].startswith("Ops artifact created")

def test_advanced_spec_endpoint_creates_artifact(tmp_path, monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', str(tmp_path))
    data = {
        "advanced": True,
        "workflowId": "testwf1",
        "raw_input": "Build a REST API for todo management",
        "title": "Todo API",
        "description": "A simple todo API",
        "requirements": ["CRUD endpoints", "SQLite backend"]
    }
    response = client.post("/spec", json=data)
    assert response.status_code == 200
    result = response.json()
    assert result["result"].startswith("Spec artifact created")
    assert "artifact_uri" in result
    assert "spec" in result
    # Check file exists
    artifact_path = result["artifact_uri"].replace("file://", "")
    assert os.path.exists(artifact_path)
    with open(artifact_path) as f:
        spec = json.load(f)
    assert spec["workflowId"] == "testwf1"
    assert spec["title"] == "Todo API"
    assert spec["description"] == "A simple todo API"
    assert "clarifications" in spec

def test_advanced_spec_endpoint_missing_fields(monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', '/tmp')
    data = {"advanced": True, "raw_input": ""}
    response = client.post("/spec", json=data)
    assert response.status_code == 200
    result = response.json()
    assert "error" in result
    assert result["error"].startswith("Spec validation failed")

def test_advanced_plan_endpoint_creates_artifact(tmp_path, monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', str(tmp_path))
    data = {
        "advanced": True,
        "workflowId": "testwf2",
        "spec_ref": "file:///tmp/spec.json",
        "description": "Plan for Todo API",
        "technologies": ["python", "fastapi"]
    }
    response = client.post("/plan", json=data)
    assert response.status_code == 200
    result = response.json()
    assert result["result"].startswith("Plan artifact created")
    assert "artifact_uri" in result
    assert "plan" in result
    artifact_path = result["artifact_uri"].replace("file://", "")
    assert os.path.exists(artifact_path)
    with open(artifact_path) as f:
        plan = json.load(f)
    assert plan["workflowId"] == "testwf2"
    assert plan["description"] == "Plan for Todo API"
    assert plan["spec_ref"] == "file:///tmp/spec.json"
    assert "steps" in plan
    assert "technologies" in plan

def test_advanced_plan_endpoint_missing_fields(monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', '/tmp')
    data = {"advanced": True, "workflowId": "wf-missing"}
    response = client.post("/plan", json=data)
    assert response.status_code == 200
    result = response.json()
    assert "error" in result
    assert result["error"].startswith("Plan validation failed")

def test_advanced_codegen_endpoint_creates_artifact(tmp_path, monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', str(tmp_path))
    data = {
        "advanced": True,
        "workflowId": "testwf3",
        "plan_ref": "file:///tmp/plan.json",
        "language": "python"
    }
    response = client.post("/codegen", json=data)
    assert response.status_code == 200
    result = response.json()
    assert result["result"].startswith("Codegen artifact created")
    assert "artifact_uri" in result
    assert "codegen" in result
    artifact_path = result["artifact_uri"].replace("file://", "")
    assert os.path.exists(artifact_path)
    with open(artifact_path) as f:
        codegen = json.load(f)
    assert codegen["workflowId"] == "testwf3"
    assert codegen["plan_ref"] == "file:///tmp/plan.json"
    assert codegen["language"] == "python"
    assert "files" in codegen
    assert codegen["files"][0]["language"] == "python"

def test_advanced_codegen_endpoint_language_selection(tmp_path, monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', str(tmp_path))
    data = {
        "advanced": True,
        "workflowId": "testwf4",
        "plan_ref": "file:///tmp/plan.json",
        "language": "typescript"
    }
    response = client.post("/codegen", json=data)
    assert response.status_code == 200
    result = response.json()
    codegen = result["codegen"]
    assert codegen["language"] == "typescript"
    assert codegen["files"][0]["language"] == "typescript"
    assert codegen["files"][0]["path"].endswith("js")

def test_advanced_codegen_endpoint_missing_fields(monkeypatch):
    monkeypatch.setenv('ARTIFACT_DIR', '/tmp')
    data = {"advanced": True, "workflowId": "wf-missing"}
    response = client.post("/codegen", json=data)
    assert response.status_code == 200
    result = response.json()
    assert "error" in result
    assert result["error"].startswith("Codegen validation failed")

def test_infra_agent_valid(tmp_path):
    # Arrange
    from agents import AdvancedInfraAgent
    import shutil
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedInfraAgent(str(artifact_dir))
    input_data = {
        "workflowId": "wf-test-1234",
        "plan_ref": "file://plan.json"
    }
    # Act
    result = agent.run(input_data)
    # Assert
    assert result["result"] == "Infra artifact created"
    assert result["artifact_uri"].startswith("file://")
    assert "infra" in result
    assert result["infra"]["workflowId"] == "wf-test-1234"
    assert result["infra"]["plan_ref"] == "file://plan.json"
    assert isinstance(result["infra"]["resources"], list)
    # Clean up
    shutil.rmtree(artifact_dir)

def test_infra_agent_invalid(tmp_path):
    # Arrange
    from agents import AdvancedInfraAgent
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedInfraAgent(str(artifact_dir))
    input_data = {"plan_ref": "file://plan.json"}  # Missing workflowId
    # Act
    result = agent.run(input_data)
    # Assert
    assert "error" not in result  # workflowId is auto-generated if missing
    assert result["result"] == "Infra artifact created"
    assert "infra" in result
    # Clean up
    import shutil
    shutil.rmtree(artifact_dir)

def test_infra_api_endpoint():
    # Arrange
    input_data = {"workflowId": "wf-api-1", "plan_ref": "file://plan.json"}
    # Act
    response = client.post("/infra", json=input_data)
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == "Infra artifact created"
    assert data["infra"]["workflowId"] == "wf-api-1"
    assert data["infra"]["plan_ref"] == "file://plan.json"
    assert isinstance(data["infra"]["resources"], list)

def test_test_agent_valid(tmp_path):
    # Arrange
    from agents import AdvancedTestAgent
    import shutil
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedTestAgent(str(artifact_dir))
    input_data = {
        "workflowId": "wf-test-5678",
        "infra_ref": "file://infra.json"
    }
    # Act
    result = agent.run(input_data)
    # Assert
    assert result["result"] == "Test artifact created"
    assert result["artifact_uri"].startswith("file://")
    assert "test" in result
    assert result["test"]["workflowId"] == "wf-test-5678"
    assert result["test"]["infra_ref"] == "file://infra.json"
    assert isinstance(result["test"]["tests"], list)
    # Clean up
    shutil.rmtree(artifact_dir)

def test_test_agent_invalid(tmp_path):
    # Arrange
    from agents import AdvancedTestAgent
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedTestAgent(str(artifact_dir))
    input_data = {"infra_ref": "file://infra.json"}  # Missing workflowId
    # Act
    result = agent.run(input_data)
    # Assert
    assert "error" not in result  # workflowId is auto-generated if missing
    assert result["result"] == "Test artifact created"
    assert "test" in result
    # Clean up
    import shutil
    shutil.rmtree(artifact_dir)

def test_test_api_endpoint():
    # Arrange
    input_data = {"workflowId": "wf-api-2", "infra_ref": "file://infra.json"}
    # Act
    response = client.post("/test", json=input_data)
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == "Test artifact created"
    assert data["test"]["workflowId"] == "wf-api-2"
    assert data["test"]["infra_ref"] == "file://infra.json"
    assert isinstance(data["test"]["tests"], list)

def test_reviewer_agent_valid(tmp_path):
    # Arrange
    from agents import AdvancedReviewerAgent
    import shutil
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedReviewerAgent(str(artifact_dir))
    input_data = {
        "workflowId": "wf-test-9012",
        "test_ref": "file://test.json"
    }
    # Act
    result = agent.run(input_data)
    # Assert
    assert result["result"] == "Review artifact created"
    assert result["artifact_uri"].startswith("file://")
    assert "review" in result
    assert result["review"]["workflowId"] == "wf-test-9012"
    assert result["review"]["test_ref"] == "file://test.json"
    assert isinstance(result["review"]["review_items"], list)
    # Clean up
    shutil.rmtree(artifact_dir)

def test_reviewer_agent_invalid(tmp_path):
    # Arrange
    from agents import AdvancedReviewerAgent
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedReviewerAgent(str(artifact_dir))
    input_data = {"test_ref": "file://test.json"}  # Missing workflowId
    # Act
    result = agent.run(input_data)
    # Assert
    assert "error" not in result  # workflowId is auto-generated if missing
    assert result["result"] == "Review artifact created"
    assert "review" in result
    # Clean up
    import shutil
    shutil.rmtree(artifact_dir)

def test_reviewer_api_endpoint():
    # Arrange
    input_data = {"workflowId": "wf-api-3", "test_ref": "file://test.json"}
    # Act
    response = client.post("/review", json=input_data)
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == "Review artifact created"
    assert data["review"]["workflowId"] == "wf-api-3"
    assert data["review"]["test_ref"] == "file://test.json"
    assert isinstance(data["review"]["review_items"], list)

def test_ops_agent_valid(tmp_path):
    # Arrange
    from agents import AdvancedOpsAgent
    import shutil
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedOpsAgent(str(artifact_dir))
    input_data = {
        "workflowId": "wf-test-ops-1",
        "review_ref": "file://review.json"
    }
    # Act
    result = agent.run(input_data)
    # Assert
    assert result["result"] == "Ops artifact created"
    assert result["artifact_uri"].startswith("file://")
    assert "ops" in result
    assert result["ops"]["workflowId"] == "wf-test-ops-1"
    assert result["ops"]["review_ref"] == "file://review.json"
    assert isinstance(result["ops"]["ops_actions"], list)
    # Clean up
    shutil.rmtree(artifact_dir)

def test_ops_agent_invalid(tmp_path):
    # Arrange
    from agents import AdvancedOpsAgent
    artifact_dir = tmp_path / "artifacts"
    agent = AdvancedOpsAgent(str(artifact_dir))
    input_data = {"review_ref": "file://review.json"}  # Missing workflowId
    # Act
    result = agent.run(input_data)
    # Assert
    assert "error" not in result  # workflowId is auto-generated if missing
    assert result["result"] == "Ops artifact created"
    assert "ops" in result
    # Clean up
    import shutil
    shutil.rmtree(artifact_dir)

def test_ops_api_endpoint():
    # Arrange
    input_data = {"workflowId": "wf-api-ops-1", "review_ref": "file://review.json"}
    # Act
    response = client.post("/ops", json=input_data)
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["result"] == "Ops artifact created"
    assert data["ops"]["workflowId"] == "wf-api-ops-1"
    assert data["ops"]["review_ref"] == "file://review.json"
    assert isinstance(data["ops"]["ops_actions"], list)
