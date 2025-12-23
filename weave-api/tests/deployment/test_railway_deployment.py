"""
Railway deployment integration tests.

Tests deployment infrastructure, health checks, and CI/CD pipeline.
"""

import os
import pytest
import requests
import yaml
from pathlib import Path


@pytest.mark.deployment
class TestPreDeployment:
    """Pre-deployment tests (run before deploying to Railway)."""
    
    def test_health_endpoint_exists(self):
        """Verify /health endpoint exists in app/api/health.py."""
        health_file = Path("app/api/health.py")
        
        assert health_file.exists(), "app/api/health.py not found"
        
        content = health_file.read_text()
        assert "@router.get(\"/health\")" in content or '@router.get("/health")' in content, \
            "/health endpoint not defined in health.py"
    
    def test_health_endpoint_checks_database(self):
        """Verify health endpoint includes database connection check."""
        health_file = Path("app/api/health.py")
        
        assert health_file.exists(), "app/api/health.py not found"
        
        content = health_file.read_text()
        assert "supabase" in content.lower() or "database" in content.lower(), \
            "Health endpoint does not check database connection"
    
    def test_port_binding_uses_environment_variable(self):
        """Verify uvicorn binds to 0.0.0.0 and uses PORT environment variable."""
        main_file = Path("app/main.py")
        
        assert main_file.exists(), "app/main.py not found"
        
        content = main_file.read_text()
        
        # Check for proper port binding pattern
        has_port_env = 'os.getenv("PORT"' in content or "os.getenv('PORT'" in content
        has_host_binding = '"0.0.0.0"' in content or "'0.0.0.0'" in content
        
        # If there's a main block, check it properly binds
        if "if __name__" in content:
            assert has_port_env, "PORT environment variable not used for port binding"
            assert has_host_binding, "App not binding to 0.0.0.0 (required for Railway)"


@pytest.mark.deployment
class TestCICDPipeline:
    """CI/CD pipeline tests."""
    
    def test_github_workflow_file_exists(self):
        """Verify GitHub Actions workflow file exists."""
        workflow_file = Path(".github/workflows/railway-deploy.yml")
        
        assert workflow_file.exists(), \
            ".github/workflows/railway-deploy.yml not found. Create workflow file for Railway deployment."
    
    def test_github_workflow_has_required_steps(self):
        """Verify GitHub Actions workflow has required deployment steps."""
        workflow_file = Path(".github/workflows/railway-deploy.yml")
        
        if not workflow_file.exists():
            pytest.skip(".github/workflows/railway-deploy.yml not created yet")
        
        content = workflow_file.read_text()
        workflow_data = yaml.safe_load(content)
        
        # Check workflow triggers on main branch
        assert "push" in workflow_data.get("on", {}), "Workflow should trigger on push"
        assert "main" in workflow_data.get("on", {}).get("push", {}).get("branches", []), \
            "Workflow should trigger on push to main branch"
        
        # Check for required steps
        jobs = workflow_data.get("jobs", {})
        deploy_job = jobs.get("deploy", {})
        steps = deploy_job.get("steps", [])
        
        step_names = [step.get("name", "").lower() for step in steps]
        
        assert any("checkout" in name for name in step_names), \
            "Workflow missing checkout step"
        assert any("railway" in name for name in step_names), \
            "Workflow missing Railway deployment step"
        assert any("health" in name for name in step_names), \
            "Workflow missing health check step"


@pytest.mark.deployment
class TestPostDeployment:
    """Post-deployment tests (run after deploying to Railway)."""
    
    def test_production_health_endpoint_responds(self, production_api_url, http_session):
        """Verify health endpoint returns 200 from production URL."""
        response = http_session.get(f"{production_api_url}/health", timeout=10)
        
        assert response.status_code == 200, \
            f"Health endpoint returned {response.status_code}, expected 200"
        
        data = response.json()
        assert data.get("status") == "healthy", \
            f"Health check status is {data.get('status')}, expected 'healthy'"
        assert "timestamp" in data, "Health check response missing timestamp"
    
    def test_production_requires_https(self, production_api_url):
        """Verify production URL uses HTTPS (Railway auto-provides SSL)."""
        assert production_api_url.startswith("https://"), \
            f"Production URL should use HTTPS, got: {production_api_url}"
    
    def test_production_environment_variable_set(self, production_api_url, http_session):
        """Verify ENVIRONMENT=production is set correctly."""
        response = http_session.get(f"{production_api_url}/health", timeout=10)
        
        assert response.status_code == 200, "Health endpoint not responding"
        
        data = response.json()
        
        # Check if environment is included in health response
        if "environment" in data:
            assert data["environment"] == "production", \
                f"Environment should be 'production', got: {data['environment']}"
