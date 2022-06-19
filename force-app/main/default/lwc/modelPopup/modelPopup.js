import { LightningElement, api } from "lwc";


export default class Modal extends LightningElement {
  showModal = false;
  
  @api getValueFromParent;
  
  @api show() {
    this.showModal = true;
  }
  handleDialogClose() {
    this.showModal = false;
  }
  
}