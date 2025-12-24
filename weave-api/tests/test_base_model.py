"""
Unit Tests for BaseModel (Story 1.5.2)
Tests verify soft delete functionality and timestamp fields.

AC-2: Database Model Standardization
RED Phase: Tests will fail until BaseModel is implemented.
Generated: 2025-12-23
"""
from datetime import datetime

from app.models.base import BaseModel


class TestBaseModel:
    """Test suite for BaseModel abstract class"""

    def test_base_model_has_required_fields(self):
        """
        GIVEN: BaseModel instance (via concrete subclass)
        WHEN: Checking model attributes
        THEN: Model has id, created_at, updated_at, deleted_at fields

        AC-2: BaseModel includes common timestamp fields
        """
        # NOTE: This test uses a concrete subclass since BaseModel is abstract
        # The DEV team will create a test model class for this
        model = BaseModel()  # Will fail until implemented

        # THEN: Has required fields
        assert hasattr(model, 'id')
        assert hasattr(model, 'created_at')
        assert hasattr(model, 'updated_at')
        assert hasattr(model, 'deleted_at')

    def test_base_model_soft_delete_sets_timestamp(self):
        """
        GIVEN: BaseModel instance with deleted_at = None
        WHEN: Calling soft_delete() method
        THEN: deleted_at timestamp is set to current time

        AC-2: Soft delete pattern sets deleted_at timestamp
        """
        model = BaseModel()

        # GIVEN: Initially not deleted
        assert model.deleted_at is None

        # WHEN: Soft deleted
        model.soft_delete()

        # THEN: deleted_at is now set
        assert model.deleted_at is not None
        assert isinstance(model.deleted_at, datetime)

    def test_base_model_is_deleted_property_when_not_deleted(self):
        """
        GIVEN: BaseModel instance with deleted_at = None
        WHEN: Checking is_deleted property
        THEN: Returns False

        AC-2: is_deleted property checks deleted_at
        """
        model = BaseModel()

        # THEN: Not deleted initially
        assert model.is_deleted is False

    def test_base_model_is_deleted_property_when_deleted(self):
        """
        GIVEN: BaseModel instance after soft_delete() called
        WHEN: Checking is_deleted property
        THEN: Returns True

        AC-2: is_deleted property returns True after soft delete
        """
        model = BaseModel()

        # WHEN: Soft deleted
        model.soft_delete()

        # THEN: Now deleted
        assert model.is_deleted is True

    def test_base_model_timestamps_auto_populate(self):
        """
        GIVEN: New BaseModel instance
        WHEN: Instance is created
        THEN: created_at and updated_at are automatically set

        AC-2: Timestamps auto-populate on model creation
        """
        model = BaseModel()

        # THEN: Timestamps are set
        assert model.created_at is not None
        assert model.updated_at is not None
        assert isinstance(model.created_at, datetime)
        assert isinstance(model.updated_at, datetime)
