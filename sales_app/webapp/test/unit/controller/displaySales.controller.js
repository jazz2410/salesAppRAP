/*global QUnit*/

sap.ui.define([
	"sales_app/controller/displaySales.controller"
], function (Controller) {
	"use strict";

	QUnit.module("displaySales Controller");

	QUnit.test("I should test the displaySales controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
