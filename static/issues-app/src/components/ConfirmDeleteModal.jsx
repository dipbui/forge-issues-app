import React from "react";
import Button from "@atlaskit/button/new";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";

export const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  issueKey,
}) => {
  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={onClose}>
          <ModalHeader hasCloseButton>
            <ModalTitle appearance="danger">
              You're about to delete issue {issueKey}
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this issue?</p>
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="danger"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
};
