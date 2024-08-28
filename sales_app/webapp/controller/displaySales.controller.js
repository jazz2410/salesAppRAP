sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    function (Controller, JSONModel, MessageToast) {
        "use strict";

        return Controller.extend("salesapp.controller.displaySales", {
            onInit: function () {

                var changeHeaderState = {
                    editable: false
                }

                var changeHeaderValues = {
                    PurchaseOrderByCustomer: undefined
                }

                var changeHeaderStateModel = new JSONModel(changeHeaderState);
                var changeHeaderValuesModel = new JSONModel(changeHeaderValues);
                this.getView().setModel(changeHeaderStateModel, 'changeHeaderStateModel');
                this.getView().setModel(changeHeaderValuesModel, 'changeHeaderValuesModel');

            },
            onSalesHeaderClick: function (oEvent) {
                const sPath = oEvent.getSource().getBindingContext().getPath(); //returns /ZTD_HEADSALES('XXXXXX')
                const itemsPath = sPath + '/to_SalesItems';
                this.byId('productDetailsPanel').bindElement(sPath);
                this.byId("smartTable").setTableBindingPath(itemsPath);
                this.byId("smartTable").rebindTable(true);
            },
            onChangeHeader: function () {
                //Toggle between change and display mode fields
                var changeHeaderStateModel = this.getView().getModel('changeHeaderStateModel');
                var state = changeHeaderStateModel.getProperty('/editable');
                changeHeaderStateModel.setProperty('/editable', !state);
            },
            onChangedHeader: function (event) {
                //Get new value from input field and update in local JSON model
                var changeHeaderValuesModel = this.getView().getModel('changeHeaderValuesModel');
                var newPurchaseOrderByCustomer = event.getParameter('newValue');
                changeHeaderValuesModel.setProperty('/PurchaseOrderByCustomer', newPurchaseOrderByCustomer);

            },
            onSaveHeader: function () {
                var panel = this.byId("productDetailsPanel");
                var salesOrder = panel.getBindingContext().getProperty('SalesOrder');

                var changeHeaderValuesModel = this.getView().getModel('changeHeaderValuesModel');
                //Get newly inserted value from local JSON model
                var newPurchaseOrderByCustomer = changeHeaderValuesModel.getProperty('/PurchaseOrderByCustomer');
                if (!newPurchaseOrderByCustomer) {
                    MessageToast.show("Noting was changed!");
                    return;
                }

                var sPath = `/ZTD_HEADSALES('${salesOrder}')`;
                var Data = {
                    SalesOrder: salesOrder,
                    PurchaseOrderByCustomer: newPurchaseOrderByCustomer
                };
                var oModel = this.getView().getModel();
                oModel.update(sPath, Data, {
                    success: function (oData, oResponse) {

                        var message = oResponse.headers['sap-message'];
                        var message_obj = JSON.parse(message);
                        console.log(message_obj);

                        if(message_obj.details.length != 0){
                            var content = message_obj.details.map(function(element){
                                return new sap.m.StandardListItem({
                                    title : element.message,
                                    //description : element.message,
                                })
                            });
                        }
      
                        this._showMessageDialog(message_obj.message,message_obj.severity,content)
                        this.getView().getModel().refresh(true);
                        this._resetModel();

                    }.bind(this),
                    error: function (error) {
                        console.log(error);
                        MessageToast.show("Error in backend system!");
                    }
                });
            },
            _showMessageDialog(sTitle,sState,sContent) {

                var status;
                switch(sState){
                    case 'success':
                        status = sap.ui.core.ValueState.Success;
                        break;
                    case 'error':
                        status = sap.ui.core.ValueState.Error;
                        break;
                    case 'warning':
                        status = sap.ui.core.ValueState.Warning;
                        break;
                }

                var oMessageDialog = new sap.m.Dialog({
                    title: sTitle,
                    type: sap.m.DialogType.Message,
                    state: status,
                    content: sContent,
                    contentHeight: "50%",
                    contentWidth: "30%",
                    draggable: true,
                    beginButton: new sap.m.Button(
                        {
                            text: "Close",
                            press: function () {
                                oMessageDialog.close()
                            }
                        }),
                    afterClose: function(){
                        oMessageDialog.destroy();
                    }    
                });
                oMessageDialog.open();
            },
            _resetModel(){
                var changeHeaderStateModel = this.getView().getModel('changeHeaderStateModel');
                changeHeaderStateModel.setProperty('/editable', false);
                var changeHeaderValuesModel = this.getView().getModel('changeHeaderValuesModel');
                changeHeaderValuesModel.setProperty('/PurchaseOrderByCustomer', undefined);
            },
            onDeliveryShow: function(){
                   var item = this.byId('table').getSelectedItems()[0];

                    if(!item){
                        MessageToast.show("Select a sales order item");
                    }
                    var sPath = item.getBindingContext().getPath();
                    var itemsPath = sPath + '/to_Deliveries';
                    console.log(itemsPath);
                    if(!this._oDialog){
                        this._oDialog = sap.ui.xmlfragment(this.getView().getId(),"salesapp.view.deliveries", this);
                        this.getView().addDependent(this._oDialog);
                    }
                    this.getView().byId('deliverySmartTable').setTableBindingPath(itemsPath);
                    this.getView().byId("deliverySmartTable").rebindTable(true);
                    this._oDialog.open();
            },
            closeDelivery: function(){
                this._oDialog.close();
            }
        });
    });
