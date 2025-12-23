"""
AWS Bedrock credential tests.

Tests AWS Bedrock configuration required for Claude AI via Amazon Bedrock.
"""

import os
import pytest


@pytest.mark.deployment
class TestAWSBedrockCredentials:
    """Tests for AWS Bedrock credentials in production."""
    
    def test_aws_bedrock_env_vars_configured(self, railway_env_vars):
        """Verify AWS Bedrock credentials are set."""
        required_vars = [
            "AWS_REGION",
            "AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY"
        ]
        
        missing_vars = []
        for var in required_vars:
            if var not in railway_env_vars or not railway_env_vars[var]:
                missing_vars.append(var)
        
        assert not missing_vars, \
            f"Missing AWS Bedrock credentials: {', '.join(missing_vars)}"
    
    def test_aws_region_is_valid(self, railway_env_vars):
        """Verify AWS_REGION is a valid AWS region."""
        aws_region = railway_env_vars.get("AWS_REGION")
        
        if not aws_region:
            pytest.skip("AWS_REGION not configured")
        
        # Common AWS regions that support Bedrock
        valid_regions = [
            "us-east-1",
            "us-west-2",
            "eu-west-1",
            "eu-central-1",
            "ap-southeast-1",
            "ap-northeast-1"
        ]
        
        assert aws_region in valid_regions, \
            f"AWS_REGION '{aws_region}' may not support Bedrock. Valid regions: {', '.join(valid_regions)}"
    
    def test_aws_access_key_format(self, railway_env_vars):
        """Verify AWS_ACCESS_KEY_ID has correct format."""
        access_key = railway_env_vars.get("AWS_ACCESS_KEY_ID")
        
        if not access_key:
            pytest.skip("AWS_ACCESS_KEY_ID not configured")
        
        # AWS access keys start with 'AKIA' for IAM users or 'ASIA' for temporary credentials
        assert access_key.startswith(("AKIA", "ASIA")), \
            f"AWS_ACCESS_KEY_ID has invalid format: should start with 'AKIA' or 'ASIA', got '{access_key[:4]}'"
        
        # AWS access keys are 20 characters long
        assert len(access_key) == 20, \
            f"AWS_ACCESS_KEY_ID has invalid length: expected 20 characters, got {len(access_key)}"
    
    def test_aws_secret_key_is_strong(self, railway_env_vars):
        """Verify AWS_SECRET_ACCESS_KEY is not a placeholder."""
        secret_key = railway_env_vars.get("AWS_SECRET_ACCESS_KEY")
        
        if not secret_key:
            pytest.skip("AWS_SECRET_ACCESS_KEY not configured")
        
        # AWS secret keys are 40 characters long
        assert len(secret_key) >= 40, \
            f"AWS_SECRET_ACCESS_KEY appears to be invalid: expected >= 40 characters, got {len(secret_key)}"
        
        # Check it's not a placeholder
        weak_values = [
            "your-secret-key",
            "changeme",
            "test",
            "placeholder"
        ]
        
        assert secret_key.lower() not in weak_values, \
            "AWS_SECRET_ACCESS_KEY appears to be a placeholder value"
