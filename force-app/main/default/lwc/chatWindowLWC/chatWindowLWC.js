import { api, LightningElement, track } from 'lwc';
import fetchMessagesFromServer from '@salesforce/apex/ChatWindow_Controller.getMessageListForWhoSidebarComponent'

export default class ChatWindowLWC extends LightningElement {
    @api idToGetMessage;
    @api isPortal;
    @api optOut;

    @track messages = [];
	@track error;
    @track showMessage = false;
    fetchedMessage123 = 'hiiieeee';
    messageList = [];
    messageListOut = [];
    messageListIn = [];

    connectedCallback(){
        this.fetchMessages();
        console.log('test message',this.messages,'-idToGetMessage-',this.idToGetMessage,'-isPortal-',this.isPortal,'-length-',this.messages.length,'-',this.showMessage);
        
        console.log('length-', this.showMessage);
    }

    fetchMessages(){
        fetchMessagesFromServer({recId : this.idToGetMessage,
            isPortal : this.isPortal})
            .then(result => {
                console.log('result-', result);
                
                console.log('test message',this.messages,'-idToGetMessage-',this.idToGetMessage,'-isPortal-',this.isPortal,'-length-',this.messages.length,'-',this.showMessage);
                this.messages = result;
                this.messages.forEach(function (element) {
                    element.isOutbound = (element.msgtype == 'Outgoing SMS' || element.msgtype == 'Outgoing') ? true : false;
                });
                console.log('all mesgs :'+ JSON.stringify(this.messages));
                console.log('outgoing :'+ JSON.stringify(this.messages.filter(item =>item.msgtype === 'Outgoing SMS')));
                console.log('incoming :'+ JSON.stringify(this.messages.filter(item =>item.msgtype === 'Incoming')));

                this.messageListOut = this.messages.filter(item =>item.msgtype === 'Outgoing SMS');
                this.messageListIn = this.messages.filter(item =>item.msgtype === 'Incoming');

                this.messageList = result;
                this.fetchMessage = JSON.stringify(this.messages[1].msg);
                this.fetchMessage = JSON.stringify(this.messages[1].msgtype);
                console.log('msg :'+ this.messages[1].msgDate);
                console.log('message-', this.messages[0]);
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