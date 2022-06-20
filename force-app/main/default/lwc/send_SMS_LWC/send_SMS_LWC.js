import { api, LightningElement, track } from 'lwc';
import getToBorrowerList from '@salesforce/apex/SendSMS_Controller.getToBorrowerList'
import sendMsg from '@salesforce/apex/SendSMS_Controller.sendMsg'
import fetchMessagesFromServer from '@salesforce/apex/ChatWindow_Controller.getMessageListForWhoSidebarComponent'


export default class Send_SMS_LWC extends LightningElement {
    
    @api value;
    @api recordId;
    @api idToGetMessage;
    @api isPortal;
    @api optOut;

    @track usersList = [];
    @track defaultUser;
    @track isPortalUser = false;
    @track showChatWindow = true;
	
	hasRendered =true;

     connectedCallback(){
		if(this.hasRendered){
         this.fetchOwnerId();
         this.fetchMessages();        
         console.log('===',this.defaultUser);
		
        this.hasRendered= false;
	    }


     }

    @track msgContext;
    
    handleInputChange(event){
        this.msgContext = event.target.value;
        console.log('input here :'+ this.msgContext);
        	
			var text =" " ;
      if (window.getSelection) {
          text = window.getSelection().toString();
          console.log('selected text value'+ text);
		  this.value=text;
      console.log('parent value'+ this.value);
        
      } else if (document.selection && document.selection.type != "Control") {
          text = document.selection.createRange().text;
      }
      return text;  
      
  
    }  

    sendMessage(){
      console.log(
        'see rec id :'+
        this.recordId + '');
        // sendMsg({recId : this.recordId, })
        // .then(data => {

        // })
    }

    fetchOwnerId(){
        getToBorrowerList({recId: this.recordId})
        .then(data => {
          this.usersList = data.map(role => ({ label: role, value: role }));
          console.log('fetchOwner data :'+ JSON.stringify(data));
          
        })
        .catch(error => {
          console.error('error here :' + error);
        });
      }

    get getDefaultUser() {
      return this.defaultUser = this.usersList[0];
    }

    get options() {
        console.log('items :'+ JSON.stringify(this.items));
        return this.usersList;
    }

    handleChange(event) {
        this.value = event.detail.value;
        console.log('selected value :'+ JSON.stringify(this.value));
    }

    linkClicked = false;
    handleLinkClick(event) {
      this.linkClicked = true;
        console.log('selected value :'+ JSON.stringify(event.detail.value));
        const modal = this.template.querySelector("c-model-Popup");
        modal.show();
        

    }
    
    get acceptedFormats() {
        return ['.pdf', '.png'];
    }

    handleUploadFinished(event) {
      
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        alert('No. of files uploaded : ' + uploadedFiles.length);
        
    }


    fetchMessages(){
      fetchMessagesFromServer({recId : this.idToGetMessage,
          isPortal : this.isPortal})
          .then(result => {
              console.log('result-', result);
              
              console.log('test message',this.messages,'-idToGetMessage-',this.idToGetMessage,'-isPortal-',this.isPortal,'-length-',this.messages.length,'-',this.showMessage);
              this.messages = result;
              console.log('all mesgs :'+ JSON.stringify(this.messages));
              console.log('outgoing :'+ JSON.stringify(this.messages.filter(item =>item.msgtype === 'Outgoing SMS')));
              console.log('incoming :'+ JSON.stringify(this.messages.filter(item =>item.msgtype === 'Incoming')));

              this.messageListOut = this.messages.filter(item =>item.msgtype === 'Outgoing SMS');
              this.messageListIn = this.messages.filter(item =>item.msgtype === 'Incoming');

              this.messageList = result;
              this.fetchMessage = JSON.stringify(this.messages[1].msg);
              this.fetchMessage = JSON.stringify(this.messages[1].msgtype);
              
              console.log('recId :'+ this.messages[0].whatId);
              console.log('toMoobbNo-'+ this.messages[0].toMobileNumber);
              console.log('frmMobNo :'+ this.messages[0].fromMobileNumber);
              console.log('messagecontext'+ this.msgContext);
              //console.log('potal': this.messages[0].fromMobileNumber)
              if(this.messages.length !== 0){
                  this.showMessage = true;
                
              }
              console.log('length-', this.showMessage,'-length-',this.messages.length);
          })
          .catch(error => {
              this.error = error;
          })
  }





}