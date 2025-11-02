'use client';

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { createRoot } from 'react-dom/client';

class ConfirmModal {
    static modalRoot = null;
    static container = null;

    static createContainer() {
        if (typeof window === 'undefined') return;
        
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'confirm-modal-container';
            document.body.appendChild(this.container);
            this.modalRoot = createRoot(this.container);
        }
    }

    static show(options) {
        return new Promise((resolve) => {
            if (typeof window === 'undefined') {
                resolve(false);
                return;
            }

            this.createContainer();

            const ConfirmDialog = () => {
                const handleConfirm = () => {
                    this.closeModal();
                    resolve(true);
                };

                const handleCancel = () => {
                    this.closeModal();
                    resolve(false);
                };

                return (
                    <Modal 
                        isOpen={true} 
                        onOpenChange={(open) => !open && handleCancel()}
                    >
                        <ModalContent>
                            <ModalHeader>{options.title}</ModalHeader>
                            <ModalBody>{options.description}</ModalBody>
                            <ModalFooter>
                                <Button onPress={handleCancel}>{options.cancelText}</Button>
                                <Button onPress={handleConfirm} color="primary">{options.confirmText}</Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                );
            };

            this.modalRoot?.render(<ConfirmDialog />);
        });
    }

    static closeModal() {
        if (this.modalRoot) {
            this.modalRoot.render(null);
        }
    }
}

export default ConfirmModal;