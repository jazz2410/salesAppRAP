sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
],
    function (Controller, JSONModel,MessageToast) {
        "use strict";

        return Controller.extend("salesapp.controller.displaySales", {
            onInit: function () {

                var changeHeaderState = {
                    editable: false
                }

                var changeHeaderValues = {
                    PurchaseOrderByCustomer : undefined
                }

                var changeHeaderStateModel = new JSONModel(changeHeaderState);
                var changeHeaderValuesModel = new JSONModel (changeHeaderValues);
                this.getView().setModel(changeHeaderStateModel, 'changeHeaderStateModel');
                this.getView().setModel(changeHeaderValuesModel,'changeHeaderValuesModel');

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
            onChangedHeader: function(event) {
                //Get new value from input field and update in local JSON model
                var changeHeaderValuesModel = this.getView().getModel('changeHeaderValuesModel');
                var newPurchaseOrderByCustomer = event.getParameter('newValue');
                changeHeaderValuesModel.setProperty('/PurchaseOrderByCustomer',newPurchaseOrderByCustomer);
            
            },
            onSaveHeader: function(){
                var panel = this.byId("productDetailsPanel");
                var salesOrder = panel.getBindingContext().getProperty('SalesOrder');
    
                var changeHeaderValuesModel = this.getView().getModel('changeHeaderValuesModel');
                //Get newly inserted value from local JSON model
                var newPurchaseOrderByCustomer = changeHeaderValuesModel.getProperty('/PurchaseOrderByCustomer');
                if(!newPurchaseOrderByCustomer)
                    {
                        MessageToast.show("Noting was changed!");
                        return;
                    }

                var sPath = `/ZTD_HEADSALES('${salesOrder}')`;
                var Data = {
                    SalesOrder : salesOrder,
                    PurchaseOrderByCustomer : newPurchaseOrderByCustomer
                };
                var oModel = this.getView().getModel();
                oModel.update(sPath,Data,{
                    success: function(){
                        MessageToast.show("Data was changed!");
                        var changeHeaderStateModel = this.getView().getModel('changeHeaderStateModel');
                        changeHeaderStateModel.setProperty('/editable', false);
                        var changeHeaderValuesModel =  this.getView().getModel('changeHeaderValuesModel');
                        changeHeaderValuesModel.setProperty('/PurchaseOrderByCustomer',undefined);
                    }.bind(this),
                    error: function(){
                        console.log("Error in backend!");
                    }
                });
            },
        });
    });
