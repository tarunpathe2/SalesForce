({
    countChar: function(component, event, helper) {
        var msg = ''+component.get('v.msgContext');
        component.set('v.msgSize', 1500 - msg.length);
        if(msg.lastIndexOf("\n") == msg.length-1 && component.get('v.isEntered')){
            component.set('v.msgContext', msg.substring(0, msg.length-1));
            component.set("v.Spinner", true);
            helper.sendMsg(component, event, helper);
            component.set('v.MMSTitle', null);
        }
    },
    
    readAllMessages: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get('c.readAllMessages');
        action.setParams({
            ParentId: recordId,
        });
        $A.enqueueAction(action);
    },
    
    getInitialData: function(component, event, helper) {
        component.set("v.Spinner", true);
        var recordId = component.get('v.recId');
        var action = component.get('c.Init');
        action.setParams({
            recId: recordId,
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                component.set("v.Spinner", false);
                var result = response.getReturnValue();
                var displayName = result['displayName'];
                var toNumber = result['toMobileNumber'];
                var fromNumber = result['fromMobileNumber'];
                var isBalSettings = result['isBalSettings'];
                var isOptIn = result['isOptIn'];
                var isOptOut = result['isOptOut'];
                var balanceAmount = result['balanceAmount'];
                var balanceAmount = result['balanceAmount'];
                var showBal = result['showBal'];
                var isNumberExists = result['isNumberExists'];
                var apiName = result['apiName'];
                var checkOptOut = result['checkOptOut'];
                component.set("v.isInitial", false);
                component.set('v.toNumber', toNumber);
                component.set('v.displayName', displayName);
                component.set('v.fromNumber', fromNumber);
                component.set('v.isBalSettings', isBalSettings);
                component.set('v.balanceAmount', balanceAmount);
                component.set('v.showBal', showBal);
                component.set('v.isNumberExists', isNumberExists);
                component.set('v.checkOptOut', checkOptOut);
                
                var custs = [];
                component.set('v.OptOut', isOptOut);
                component.set('v.OptIn', isOptIn);
                var childCmp = component.find('chatWindowId');
                if (childCmp && childCmp.isValid()) {
                    childCmp.refreshChatWindow();
                } 
            }
        });
        
        $A.enqueueAction(action);
    },
    
    getEmailTemplate: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get('c.getEmailTemplateList');
        action.setParams({
            recId: recordId,
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var result = response.getReturnValue();
                var EmailTemp = result;
                
                component.set('v.tempList', EmailTemp);
            }
        });
        
        $A.enqueueAction(action);
    },
    
    getTempBody: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var temptId = component.get('v.tempId');
        if (temptId) {
            var action = component.get('c.getTempData');
            action.setParams({
                tempId: temptId,
                recId: recordId,
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === 'SUCCESS') {
                    var result = response.getReturnValue();
                    if (result) {
                        component.set('v.TemplateData', result[0]);
                        component.set('v.mergeTemplateData', result[1]);
                        if (component.get('v.isMsgContextFromTemp') == 'True') {
                            component.set('v.msgContext', result[1]);
                            component.set('v.isMsgContextFromTemp', ' ');
                        }
                        component.set('v.tempPreview', true);
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    sendMsg: function(component, event, helper) {
        component.set("v.Spinner", true);
        if (component.get('v.extId')) {
            var recordId = component.get('v.extId');
        } else {
            var recordId = component.get('v.recordId');
        }
        var toNumber = component.get('v.toNumber');
        var fromNumber = component.get('v.fromNumber');
        var msgContext = component.get('v.msgContext');
        var MMSurl = component.get('v.MMSLink');
        var isPortal = component.get('v.isPortal');
        
        //return;
        
        component.set('v.msgContext', null);
        component.set('v.MMSLink', null);
        var tId = component.get('v.tempId');
        if((msgContext == null || msgContext == ' ' || msgContext == '' || msgContext == undefined) && 
           (MMSurl == null || MMSurl == ' ' || MMSurl == '' || MMSurl == undefined)){
            var toastEvent = $A.get('e.force:showToast');
            toastEvent.setParams({
                title: 'Error',
                message: 'Message Body should not be blank',
                duration: '5000',
                type: 'error',
                mode: 'pester', 
            });
            toastEvent.fire();
        }else if(toNumber == null || toNumber == ' ' || toNumber == '' || toNumber == undefined){
            var toastEvent = $A.get('e.force:showToast');
            toastEvent.setParams({
                title: 'Error',
                message: 'To number is not Present',
                duration: '5000',
                type: 'error',
                mode: 'pester',
            });
            toastEvent.fire();
        }else{
            var action = component.get('c.sendMsg');
            action.setParams({
                recId: recordId,
                toNumber: toNumber,
                fromNumber: fromNumber,
                body: encodeURI(msgContext),
                publicUrl: MMSurl,
                tempId: tId,
                isPortal: isPortal
            });
            action.setCallback(this, function(response) {
                var state = response.getState();
                if (state === 'SUCCESS') {
                    var result = response.getReturnValue();
                    component.set("v.Spinner", false);
                    if (result == 'MessageSent') {
                        component.set('v.msgSize', '1500');
                    } else{
                        var toastEvent = $A.get('e.force:showToast');
                        toastEvent.setParams({
                            title: 'Error',
                            message: result,
                            duration: '5000',
                            type: 'error',
                            mode: 'pester',
                        });
                        toastEvent.fire();
                    }                    
                } else if (state === 'ERROR') {
                    component.set("v.Spinner", false);
                    var toastEvent = $A.get('e.force:showToast');
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Message not sent, error with server',
                        duration: '5000',
                        type: 'error',
                        mode: 'pester',
                    });
                    toastEvent.fire();
                }
                component.set("v.loadChatWindow", true);
                var childCmp = component.find('chatWindowId');
                if (childCmp && childCmp.isValid()) {
                    childCmp.refreshChatWindow();
                }
                
            });
            $A.enqueueAction(action);
        }
    },
    
    
    // Send Default Message
    sendDefaultMessage: function(component, event, helper) {
        component.set("v.Spinner", true);
        var recordId = component.get('v.recordId');
        var toNumber = component.get('v.toNumber');
        var fromNumber = component.get('v.fromNumber');
        var tId = component.get('v.tempId');
        var action = component.get('c.sendDefaultMessage');
        action.setParams({
            recId: recordId,
            toNumber: toNumber,
            fromNumber: fromNumber,
            tempId: tId,
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                component.set("v.Spinner", false);
                var result = response.getReturnValue();
                if (result == 'MessageSent') {
                    component.set('v.msgSize', '1500');
                } else{
                    var toastEvent = $A.get('e.force:showToast');
                    toastEvent.setParams({
                        title: 'Error',
                        message: result,
                        duration: '5000',
                        type: 'error',
                        mode: 'pester',
                    });
                    toastEvent.fire();
                }
            }else if(state === 'ERROR') {
                component.set("v.Spinner", false);
                var toastEvent = $A.get('e.force:showToast');
                toastEvent.setParams({
                    title: 'Error',
                    message: 'Message not sent, error with server',
                    duration: '5000',
                    type: 'error',
                    mode: 'pester',
                });
                toastEvent.fire();
            }
            var childCmp = component.find('chatWindowId');
            if (childCmp && childCmp.isValid()) {
                childCmp.refreshChatWindow();
            }
        });
        $A.enqueueAction(action);
    },
    
    getPublicUrl: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get('c.getpublicUrl');
        action.setParams({
            recId: recordId,
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var result = response.getReturnValue();
                if (result) {
                    component.set('v.MMSLink', result.pubUrl);
                    component.set('v.MMSTitle', result.imgTitle);
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    saveScheduleMsg: function(component, event, helper) {
        component.set("v.Spinner", true);
        var recordId = component.get('v.recId');
        var toNumber = component.get('v.toNumber');
        var fromNumber = component.get('v.fromNumber');
        var msgContext = component.get('v.msgContext');
        var scheduleDate = component.get('v.ScheduleDate');
        var MMSurl = component.get('v.MMSLink');
        var tId = component.get('v.tempId');
        var action = component.get('c.saveScheduleTask');
        action.setParams({
            recId: recordId,
            toNum: toNumber,
            fromNum: fromNumber,
            msg: msgContext,
            schDate: scheduleDate,
            mmsUrl: MMSurl,
            tempId: tId,
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                var result = response.getReturnValue();
                if (result) {
                    component.set("v.Spinner", false);
                } else {
                    component.set("v.Spinner", false);
                    var toastEvent = $A.get('e.force:showToast');
                    toastEvent.setParams({
                        title: 'Error',
                        message: 'Please add Scheduled date and Message body to schedule message',
                        duration: '5000',
                        type: 'error',
                        mode: 'pester',
                    });
                    toastEvent.fire();
                }
                component.set('v.isScheduleMsg', false);
                component.set('v.msgContext', null);
                component.set('v.msgSize', 1500);
            }
        });
        $A.enqueueAction(action);
    },
    
    fetchToBorrowers : function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get("c.getToBorrowerList");
        action.setParams({
            recId : recordId
        });
        action.setCallback(this,function(data){
            var state = data.getState();
            var response = data.getReturnValue();
            if(state == "SUCCESS"){
                component.set('v.ToBorrowerList', response);
                if(response.length > 0){
                    if(component.get('v.isPortal')){
                        component.set('v.toBorrower', "Portal");
                    }else{
                        component.set('v.toBorrower', response[0]);
                    }
                    
                }
                component.set('v.ToBorrowerListSize', response.length);
            }else if(state = "ERROR"){
                alert('Unknown error');
            }
        });
        $A.enqueueAction(action);
    },
    
    fetchToBorrowerPhone : function(component, event, helper) {
        var recordId = component.get('v.recId');
        var borrowerName = component.get('v.toBorrower');
        var action = component.get("c.getToBorrowerNumber");
        action.setParams({
            recId : recordId,
            borrowerName : borrowerName
        });
        action.setCallback(this,function(data){
            var state = data.getState();
            var response = data.getReturnValue();
            if(state == "SUCCESS"){
                if(response != null && response != ' ' && response != '' && response != undefined){
                    component.set('v.toNumber', response);
                }
            }else if(state = "ERROR"){
                alert('Unknown error');
            }
        });
        $A.enqueueAction(action);
    },
    
    fetchToPhoneNumbers: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get('c.getToPhoneNumbers');
        action.setParams({
            recId: recordId,
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            var response = data.getReturnValue();
            if (state == 'SUCCESS') {
                component.set('v.ToNumberList', response);
                if (response.length > 0) {
                    component.set('v.toNumber', response[0]);
                }
                component.set('v.phoneNumberListSize', response.length);
                //$A.get("e.force:refreshView").fire();
            } else if ((state = 'ERROR')) {
            }
            component.set("v.isInitial", false);
        });
        $A.enqueueAction(action);
    },
    
    isRecentMessageOnPortal: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get('c.isRecentMessageOnPortal');
        action.setParams({
            ParentId: recordId,
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            var response = data.getReturnValue();
            if (state == 'SUCCESS') {
                if (response) {
                    component.set('v.isPortal', response);
                    if(component.get('v.ToBorrowerList').length > 1){
                        component.find('selToNumber').set("v.value", component.get('v.ToBorrowerList')[component.get('v.ToBorrowerList').length - 1]);
                    }
                }
            } else if ((state = 'ERROR')) {
            }
        });
        $A.enqueueAction(action);
    },
    
    fetchRecentTaskToPhoneNumber: function(component, event, helper) {
        var recordId = component.get('v.recId');
        var action = component.get('c.getRecentTaskToPhoneNumber');
        action.setParams({
            recId: recordId,
        });
        action.setCallback(this, function(data) {
            var state = data.getState();
            var response = data.getReturnValue();
            if (state == 'SUCCESS') {
                if (response != null) {
                    component.find('selToNumber').set('v.value', response);
                }
            } else if (state == 'ERROR') {
            }
        });
    },
    
    onInsert: function(component, event, helper) {
        helper.getEmailTemplate(component, event, helper);
        component.set('v.tempPreview', false);
        component.set('v.tempId', null);
        var templateBody = component.get('v.mergeTemplateData');
        if (templateBody != null && templateBody != ' ' && templateBody != '' && templateBody != undefined) {
            component.set('v.msgContext', templateBody);
            component.set('v.msgSize', 1500 - templateBody.length);
        }
        var addButton = component.get('v.modalPopup');
        if (addButton) {
            component.set('v.modalPopup', false);
        } else {
            component.set('v.modalPopup', true);
        }
    },
    
    checkOptInOptOut: function(component, event, helper) {
        let recordId = component.get('v.recordId');
        if(recordId && component && component.isValid()){
            let action = component.get('c.checkOptIn');
            action.setParams({
                recId: recordId,
            });
            action.setCallback(this, function(response) {
                if (response.getState() === 'SUCCESS') {
                    component.set('v.OptIn', response.getReturnValue());
                }
            });
            $A.enqueueAction(action);
            
            let action2 = component.get('c.checkOptOut');
            action2.setParams({
                recId: recordId,
            });
            action2.setCallback(this, function(response) {
                if (response.getState() === 'SUCCESS') {
                    component.set('v.OptOut', response.getReturnValue());
                }
            });
            $A.enqueueAction(action2);
        }
    },
});