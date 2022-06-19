({
    keyCheck : function(component, event, helper){
        if (event.which == 13 && !event.shiftKey && !event.ctrlKey){
            component.set('v.isEntered', true);
        }else{
            component.set('v.isEntered', false);
        }   
        helper.countChar(component, event, helper);
    },
    
    doInit: function(component, event, helper) {
        var recId = component.get('v.recordId');
        if (component.get('v.extId')) {
            component.set('v.recId', component.get('v.extId'));
        } else {
            component.set('v.recId', recId);
        }
        helper.getInitialData(component, event, helper);
        helper.fetchToPhoneNumbers(component, event, helper);
        helper.fetchToBorrowers(component, event, helper);
        helper.isRecentMessageOnPortal(component, event, helper);
        if (!component.get('v.calledFromUtility')) {
            // Get the empApi component
            const empApi = component.find('empApi');
            // Get the channel from the input box
            const channel = '/topic/Messagenotifications_OEM';
            // Replay option to get new events
            const replayId = -1;
            // Subscribe to an event
            empApi
            .subscribe(
                channel,
                replayId,
                $A.getCallback(eventReceived => {
                    if (component && component.isValid()) {
                    helper.checkOptInOptOut(component, event, helper);
                    // Process event (this is called each time we receive an event)
                    let parentId = component.get('v.recordId');
                    if (eventReceived.data && eventReceived.data.sobject && parentId === eventReceived.data.sobject.Parent_SObject_Id__c){
                    if(parentId.startsWith("001")){
                    if(eventReceived.data.sobject.Portal__c){
                    component.set("v.isPortal",true);
                    if(component.get('v.ToBorrowerList').length > 1){
                    component.find('selToNumber').set("v.value", component.get('v.ToBorrowerList')[component.get('v.ToBorrowerList').length - 1]);
                    //component.set('v.isNumberExists', true);
                    // component.set('v.isNumberExists', false);	
                }
                               }else{  //added 19 oct
                               component.set("v.isPortal",false);
                component.find('selToNumber').set("v.value", component.get('v.ToBorrowerList')[0]);    
            //component.set('v.isNumberExists', true);
            //component.set('v.isNumberExists', false);        
        }
    }
    let childCmp = component.find('chatWindowId');
    if (childCmp && childCmp.isValid()) {
    childCmp.refreshChatWindow();
}
 }
 }
 })
)
.then(subscription => {
});
}
    const empApiStauts = component.find('empApi');
    const channelStatus = '/topic/UpdateMessageStatus_OEM';
    const replayIdStatus = -1;
    empApiStauts
    .subscribe(
    channelStatus,
    replayIdStatus,
    $A.getCallback(eventReceived => {
    if (component && component.isValid()) {
    var childCmp = component.find('chatWindowId');
    if (childCmp && childCmp.isValid()) {
    childCmp.refreshChatWindow();
}
}
})
    ).then(subscription => {});
},
    
    onSendDefault: function(component, event, helper) {
        helper.sendDefaultMessage(component, event, helper);
        var childCmp = component.find('chatWindowId');
        if (childCmp && childCmp.isValid()) {
            childCmp.refreshChatWindow();
        }
    },
    
    selectedToNumber: function(component, event, helper) {
        var toNumber = '';
        if (component.find('selectToNumber') && component.find('selectToNumber').isValid()) {
            toNumber = component.find('selectToNumber').get('v.value');
            component.set('v.toNumber', toNumber);
        }
    },
    
    selectedTemp: function(component, event, helper) {
        component.set('v.tempPreview', false);
        if (component.find('TempName') && component.find('TempName').isValid()) {
            component.set('v.tempId', component.find('TempName').get('v.value'));
        }
        helper.getTempBody(component, event, helper);
    },
    
    onSend: function(component, event, helper) {
        component.set("v.Spinner", true);
        var msgContext = component.get('v.msgContext');
        var MMSurl = component.get('v.MMSLink');
        
        if ((msgContext != null && msgContext != ' ' && msgContext != '' && msgContext != undefined) || 
            (MMSurl != null && MMSurl != ' ' && MMSurl != '' && MMSurl != undefined)) {
            helper.sendMsg(component, event, helper);
            component.set('v.MMSTitle', null);
        }else{
            component.set("v.Spinner", false);
            var toastEvent = $A.get('e.force:showToast');
            toastEvent.setParams({
                title: 'Error',
                message: 'Message Body should not be blank',
                duration: '5000',
                type: 'error',
                mode: 'pester',
            });
            toastEvent.fire();
        }
    },
    
    openTemplateModal: function(component, event, helper) {
        helper.getEmailTemplate(component, event, helper);
        component.set('v.tempPreview', false);
        component.set('v.TemplateData', '');
        helper.getEmailTemplate(component, event, helper);
        var addButton = component.get('v.modalPopup');
        if (addButton) {
            component.set('v.modalPopup', false);
        } else {
            component.set('v.modalPopup', true);
        }
    },
    
    doHandlebackEvent: function(component, event, helper) {
        var childCmp;
        if (component.find('templateMessageId') && component.find('templateMessageId').isValid()) {
            childCmp = component.find('templateMessageId');
        }
        var templateBody = childCmp.get('v.body');
        var isTemplateNew = childCmp.get('v.isNew');
        
        if (templateBody != null && templateBody != ' ' && templateBody != '' && templateBody != undefined && isTemplateNew) {
            component.set('v.isMsgContextFromTemp', 'True');
            var eventParam = event.getParam('returnData');
            var temptIdFromEvent = event.getParam('tempId');
            component.set('v.tempId', temptIdFromEvent);
            helper.getTempBody(component, event, helper);
            var templateBody = component.get('v.isMsgContextFromTemp');
            if (templateBody != null && templateBody != ' ' && templateBody != '' && templateBody != undefined) {
                component.set('v.msgContext', templateBody);
                component.set('v.msgSize', 1500 - templateBody.length);
            }
            if (eventParam == 'Close') {
                component.set('v.modalPopup', true);
                component.set('v.modalPopupNewTemplate', false);
            } else {
                component.set('v.modalPopup', false);
                component.set('v.modalPopupNewTemplate', false);
            }
            component.set('v.tempId', temptIdFromEvent);
        } else {
            helper.getEmailTemplate(component, event, helper);
            
            var eventParam = event.getParam('returnData');
            var temptIdFromEvent = event.getParam('tempId');
            
            if (eventParam == 'Close') {
                component.set('v.modalPopup', true);
                component.set('v.modalPopupNewTemplate', false);
            } else {
                component.set('v.modalPopup', false);
                component.set('v.modalPopupNewTemplate', false);
            }
            component.set('v.tempId', temptIdFromEvent);
        }
    },
    
    onCancel: function(component, event, helper) {
        component.set('v.tempId', null);
        var addButton = component.get('v.modalPopup');
        var preview = component.get('v.tempPreview');
        if (addButton) {
            component.set('v.modalPopup', false);
            component.set('v.tempPreview', false);
        }
    },
    
    onInsert: function(component, event, helper) {
        helper.onInsert(component, event, helper);
    },
    
    onDelete: function(component, event, helper) {
        var templateId = component.get('v.tempId');
        var action = component.get('c.deleteSMSTemplate');
        action.setParams({
            templateId: templateId,
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                component.set('v.tempId', null);
                component.set('v.tempPreview', false);
                component.find('TempName').set('v.value','');
                $A.get('e.force:refreshView').fire();
                helper.getEmailTemplate(component, event, helper);
                var toastEvent = $A.get('e.force:showToast');
                toastEvent.setParams({
                    title: 'success',
                    message: 'Template deleted!',
                    duration: '5000',
                    type: 'success',
                    mode: 'pester',
                });
                toastEvent.fire();
                component.set("v.Spinner", false);
                
            }
        });
        $A.enqueueAction(action);
    },
    
    newTemplateModal: function(component, event, helper) {
        var addButton = component.get('v.modalPopup');
        if (addButton) {
            component.set('v.modalPopup', false);
            var addButton1 = component.get('v.modalPopupNewTemplate');
            if (addButton1) {
                component.set('v.modalPopupNewTemplate', false);
            } else {
                component.set('v.modalPopupNewTemplate', true);
            }
        }
    },
    
    openImageModal: function(component, event, helper) {
        var imgeUpload = component.get('v.FilemodalPopup');
        if (imgeUpload) {
            component.set('v.FilemodalPopup', false);
        } else {
            component.set('v.FilemodalPopup', true);
        }
    },
    
    closeClick: function(component, event, helper) {
        var imgeUpload = component.get('v.FilemodalPopup');
        if (imgeUpload) {
            component.set('v.FilemodalPopup', false);
        } else {
            component.set('v.FilemodalPopup', true);
        }
    },
    
    handleUploadFinished: function(component, event, helper) {
        var imgeUpload = component.get('v.FilemodalPopup');
        if (imgeUpload) {
            component.set('v.FilemodalPopup', false);
        } else {
            component.set('v.FilemodalPopup', true);
        }
        helper.getPublicUrl(component, event, helper);
    },
    
    openSchedule: function(component, event, helper) {
        var action = component.get('c.getCurrentDateTime');
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                component.set('v.CurrentDateTime', response.getReturnValue());
                
                var sch = component.get('v.isScheduleMsg');
                if (sch) {
                    component.set('v.isScheduleMsg', false);
                } else {
                    component.set('v.isScheduleMsg', true);
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    closeSchedule: function(component, event, helper) {
        var sch = component.get('v.isScheduleMsg');
        if (sch) {
            component.set('v.isScheduleMsg', false);
        } else {
            component.set('v.isScheduleMsg', true);
        }
    },
    
    onSaveSchedule: function(component, event, helper) {
        var selectedDate = component.find('schedule').get('v.value');
        component.set('v.ScheduleDate', selectedDate);
        
        helper.saveScheduleMsg(component, event, helper);
    },
    
    handleBorrowerPicklist: function(component, event, helper) {
        var selectedPhone = component.find('selToNumber').get('v.value');
        if(selectedPhone === "Portal"){
            component.set('v.isPortal', true);
            // component.set('v.isNumberExists', true);
            // component.set('v.isNumberExists', false);
            //component.set('v.loadChatWindow', false);
            //component.set('v.loadChatWindow', true);
            
        }else{
            component.set('v.isPortal', false);
            // component.set('v.isNumberExists', true);
            // component.set('v.isNumberExists', false);
            //component.set('v.loadChatWindow', false);
            // component.set('v.loadChatWindow', true);
        }
        component.set('v.toBorrower', selectedPhone);
        helper.fetchToBorrowerPhone(component, event, helper);        
    },
    
    handlePhonePicklist: function(component, event, helper) {
        var selectedPhone = component.find('selToNumber').get('v.value');
        component.set('v.toNumber', selectedPhone);
    },
    
    refreshChatWindow: function(component, event, helper) {
        var childCmp = component.find('chatWindowId');
        if (childCmp && childCmp.isValid()) {
            childCmp.refreshChatWindow();
        }
    },
});