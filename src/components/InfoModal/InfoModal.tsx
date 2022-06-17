import { ReactNode, useState } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ModalProps,
} from "reactstrap";

interface InfoModalProps {
  title: string;
  className?: string;
  children?: ReactNode;
  footerChildren?: ReactNode;
}

let TOGGLED = false;
const toggle = () => (TOGGLED = !TOGGLED);

const InfoModal = (props: InfoModalProps) => (
  <Modal isOpen={TOGGLED} toggle={toggle} className={props.className}>
    <ModalHeader toggle={toggle}>{props.title}</ModalHeader>
    <ModalBody>{props.children}</ModalBody>
    <ModalFooter>
      {props.footerChildren}
      <Button color="secondary" onClick={toggle}>
        Close
      </Button>
    </ModalFooter>
  </Modal>
);

export default InfoModal;
