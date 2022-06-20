import { LightningElement, api } from "lwc";


export default class Modal extends LightningElement {
  showModal = false;
  @api enteredurl;
  @api getValueFromParent;
  @api urlValue;
  @api show() {
    this.showModal = true;
  }
  handleDialogClose() {
    this.showModal = false;
  }
  urlentered(event){
    var v1=event.target.value;
    this.urlValue=v1;
    

  }
  urlinsert(){
  
	 let text1 = "Free Web Building Tutorials!";                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          let text = "Free Web Building Tutorials!";
  let result = text1.link("https://www.w3schools.com"); 
this.template.querySelector().innerHTML=message.replace(text1,result);

  }
  
}