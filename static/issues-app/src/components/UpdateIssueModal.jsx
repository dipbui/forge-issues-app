import { useState } from "react";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog";
import TextField from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import TextArea from "@atlaskit/textarea";
import Button from "@atlaskit/button/new";

export const UpdateIssueModal = ({
  isOpen,
  onClose,
  issue,
  onUpdate,
  statusOptions,
  issueTypeOptions,
  assignees,
}) => {
  const [updatedFields, setUpdatedFields] = useState({
    summary: issue?.summary || "",
    description: issue?.description || "",
    status:
      statusOptions.find((opt) => opt.value === issue?.status.toLowerCase()) ||
      statusOptions[0],
    type:
      issueTypeOptions.find((opt) => opt.value === issue?.type.toLowerCase()) ||
      issueTypeOptions[0],
    assignee:
      assignees.find((opt) => opt.value === issue?.assigneeAccountId) || null,
  });

  const handleFieldChange = (field, value) => {
    setUpdatedFields((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onUpdate({
      issueId: issue.id,
      fields: {
        summary: updatedFields.summary,
        description: updatedFields.description,
        status: updatedFields.status.value,
        assignee: updatedFields.assignee?.value || null,
      },
    });
  };

  if (!issue) return null;

  return (
    <Modal onClose={onClose}>
      <ModalHeader hasCloseButton>
        <ModalTitle>Update Issue: {issue.key}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <TextField
            name="summary"
            label="Summary"
            value={updatedFields.summary}
            onChange={(e) => handleFieldChange("summary", e.target.value)}
            isRequired
          />

          <TextArea
            name="description"
            label="Description"
            value={updatedFields.description}
            onChange={(e) => handleFieldChange("description", e.target.value)}
          />

          <Select
            name="status"
            options={statusOptions}
            value={updatedFields.status}
            onChange={(option) => handleFieldChange("status", option)}
            label="Status"
            isSearchable={false}
          />

          <div>
            <label
              htmlFor="type"
              style={{
                display: "block",
                marginBottom: "4px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#42526E",
              }}
            >
              Issue Type
            </label>
            <Select
              name="type"
              options={issueTypeOptions}
              value={updatedFields.type}
              isDisabled
              label="Issue Type"
            />
          </div>

          <Select
            name="assignee"
            options={[...assignees]}
            value={updatedFields.assignee}
            onChange={(option) => handleFieldChange("assignee", option)}
            label="Assignee"
            placeholder="Select assignee"
            isClearable
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button appearance="subtle" onClick={onClose}>
          Cancel
        </Button>
        <Button appearance="primary" onClick={handleSubmit}>
          Update
        </Button>
      </ModalFooter>
    </Modal>
  );
};
