describe("Unit tests for BC base model class.", function() {
	var oldSiteHelper,
		siteToken = "123",
		rootUrl = "https://secure.businesscatalyst.com/",
		expectedUrl = rootUrl + "api/v2/persons";
	
	beforeEach(function() {
		oldSiteHelper = BCAPI.Helper.Site;
		
		BCAPI.Mocks.Helper.Site(undefined, siteToken, rootUrl);
	});
	
	afterEach(function() {
		BCAPI.Helper.Site = oldSiteHelper;
	});

	it("Check attributes default values.", function() {
		var model = new BCAPI.Mocks.Models.PersonModel();
		
		expect(model.get("firstName")).toBe("first_name_default");
		expect(model.get("lastName")).toBe("last_name_default");
	});
	
	it("Check attributes initialization through constructor.", function() {
		var model = new BCAPI.Mocks.Models.PersonModel({
			firstName: "John",
			lastName: "Doe"
		});
					
		expect(model.get("firstName")).toBe("John");
		expect(model.get("lastName")).toBe("Doe");			
	});
	
	it("Check default authorization site header", function() {
		var model = new BCAPI.Mocks.Models.PersonModel();
		
		var headers = model.headers();
		
		expect(headers.Authorization).toBe(siteToken);
	});		
	
	it("Check attributes initialization through set.", function() {
		var model = new BCAPI.Mocks.Models.PersonModel();
		
		model.set({
			firstName: "John",
			lastName: "Doe"
		});
					
		expect(model.get("firstName")).toBe("John");
		expect(model.get("lastName")).toBe("Doe");			
	});
	
	it("Check url built ok.", function() {
		var model = new BCAPI.Mocks.Models.PersonModel();
		
		expect(model.urlRoot()).toBe(expectedUrl);
	});
	
	it("Check error raised if no endpoint defined.", function() {
		var model = new BCAPI.Models.Model();
		
		expect(model.endpoint).toThrow();
	});
	
	/**
	 * This method is reused for ensuring correct ajax call is done for save operation.
	 */
	function _assertCorrectSaveCall(request) {
		expect(request.type).toBe("POST");
		expect(request.url).toBe(expectedUrl);
		expect(request.headers.Authorization).toBe(siteToken);
		expect(request.dataType).toBe("json");
		
		var data = JSON.parse(request.data);
		expect(data.firstName).toBe("John");
		expect(data.lastName).toBe("Doe");
		
		expect(request.contentType).toBe("application/json");			
	}
	
	it("Check save operation ok.", function() {
		var model = new BCAPI.Mocks.Models.PersonModel({
			firstName: "John",
			lastName: "Doe"
		});
		
		var callbackCalled = false;

		function successHandler(returnedModel, resp, options) {
			expect(returnedModel).toBe(model);
			expect(resp).not.toBe(undefined);
			expect(options.testKey).toBe(123);
			
			callbackCalled = true;
		}
		
		spyOn($, "ajax").andCallFake(function(request) {
			_assertCorrectSaveCall(request);
			
			request.success(model);
		});
					
		runs(function() {
			model.save({success: successHandler,
						testKey: 123});
		});
		
		waitsFor(function() {
			return callbackCalled;
			
		}, "Model save success handler not invoked.", 50);
	});
	
	it("Check save operation error execute error handler.", function() {
		var expectedModel = new BCAPI.Mocks.Models.PersonModel({
			firstName: "John",
			lastName: "Doe"
		}),	callbackCalled = false;
		
		function errorHandler(model, xhr, options) {
			expect(model).toBe(expectedModel);
			expect(xhr).not.toBe(undefined);
			expect(options.testKey).toBe("123");
			
			callbackCalled = true;				
		}
		
		spyOn($, "ajax").andCallFake(function(request) {
			_assertCorrectSaveCall(request);
			
			request.error(expectedModel);
		});
		
		runs(function() {
			expectedModel.save({error: errorHandler,
								testKey: "123"});
		});
		
		waitsFor(function() {				
			return callbackCalled;
		}, "Model save error handler not invoked.", 50);
	});
	
	/**
	 * This method makes sure request for model destroy sends correct data to server.
	 */
	function _assertCorrectDeleteCall(request) {
		expect(request.type).toBe("DELETE");
		expect(request.url).toBe(expectedUrl + "/1");
		expect(request.headers.Authorization).toBe(siteToken);			
	}
	
	it("Check destroy operation executes ok.", function() {
		var expectedModel = new BCAPI.Mocks.Models.PersonModel({idCustom: 1});
		
		var callbackCalled = false;
		
		function successHandler(model, response) {
			expect(model).toBe(expectedModel);
			expect(response).not.toBe(undefined);
			
			callbackCalled = true;
		};
		
		spyOn($, "ajax").andCallFake(function(request) {
			_assertCorrectDeleteCall(request);
			
			request.success(expectedModel);
		});
		
		runs(function() {
			expectedModel.destroy({success: successHandler});
		});
		
		waitsFor(function() {
			return callbackCalled;
		});
	});
	
	it("Check destroy error handler invoked.", function() {
		var expectedModel = new BCAPI.Mocks.Models.PersonModel({idCustom: 1});
		
		var callbackCalled = false;
		
		function errorHandler(model, xhr, options) {
			expect(model).toBe(expectedModel);
			expect(xhr).not.toBe(undefined);
			expect(options.testKey).toBe(123);
			
			callbackCalled = true;
		};
		
		spyOn($, "ajax").andCallFake(function(request) {
			_assertCorrectDeleteCall(request);
			
			request.error(expectedModel);
		});
		
		runs(function() {
			expectedModel.destroy({error: errorHandler, testKey: 123});
		});
		
		waitsFor(function() {
			return callbackCalled;
		});			
	});
});