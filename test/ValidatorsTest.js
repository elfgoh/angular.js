ValidatorTest = TestCase('ValidatorTest');

ValidatorTest.prototype.testItShouldHaveThisSet = function() {
  expectAsserts(5);
  var self;
  angular.validator.myValidator = function(first, last){
    assertEquals('misko', first);
    assertEquals('hevery', last);
    self = this;
  };
  var c = compile('<input name="name" ng-validate="myValidator:\'hevery\'"/>');
  c.scope.set('name', 'misko');
  c.scope.set('state', 'abc');
  c.binder.updateView();
  assertEquals('abc', self.state);
  assertEquals('misko', self.name);
  assertEquals('name', self.$element.name);
};

ValidatorTest.prototype.testRegexp = function() {
  assertEquals(angular.validator.regexp("abc", /x/, "E1"), "E1");
  assertEquals(angular.validator.regexp("abc", '/x/'),
      "Value does not match expected format /x/.");
  assertEquals(angular.validator.regexp("ab", '^ab$'), null);
  assertEquals(angular.validator.regexp("ab", '^axb$', "E3"), "E3");
};

ValidatorTest.prototype.testNumber = function() {
  assertEquals(angular.validator.number("ab"), "Value is not a number.");
  assertEquals(angular.validator.number("-0.1",0), "Value can not be less than 0.");
  assertEquals(angular.validator.number("10.1",0,10), "Value can not be greater than 10.");
  assertEquals(angular.validator.number("1.2"), null);
  assertEquals(angular.validator.number(" 1 ", 1, 1), null);
};

ValidatorTest.prototype.testInteger = function() {
  assertEquals(angular.validator.integer("ab"), "Value is not a number.");
  assertEquals(angular.validator.integer("1.1"), "Value is not a whole number.");
  assertEquals(angular.validator.integer("1.0"), "Value is not a whole number.");
  assertEquals(angular.validator.integer("1."), "Value is not a whole number.");
  assertEquals(angular.validator.integer("-1",0), "Value can not be less than 0.");
  assertEquals(angular.validator.integer("11",0,10), "Value can not be greater than 10.");
  assertEquals(angular.validator.integer("1"), null);
  assertEquals(angular.validator.integer(" 1 ", 1, 1), null);
};

ValidatorTest.prototype.testDate = function() {
  var error = "Value is not a date. (Expecting format: 12/31/2009).";
  assertEquals(angular.validator.date("ab"), error);
  assertEquals(angular.validator.date("12/31/2009"), null);
};

ValidatorTest.prototype.testPhone = function() {
  var error = "Phone number needs to be in 1(987)654-3210 format in North America or +999 (123) 45678 906 internationaly.";
  assertEquals(angular.validator.phone("ab"), error);
  assertEquals(null, angular.validator.phone("1(408)757-3023"));
  assertEquals(null, angular.validator.phone("+421 (0905) 933 297"));
  assertEquals(null, angular.validator.phone("+421 0905 933 297"));
};

ValidatorTest.prototype.testSSN = function() {
  var error = "SSN needs to be in 999-99-9999 format.";
  assertEquals(angular.validator.ssn("ab"), error);
  assertEquals(angular.validator.ssn("123-45-6789"), null);
};

ValidatorTest.prototype.testURL = function() {
  var error = "URL needs to be in http://server[:port]/path format.";
  assertEquals(angular.validator.url("ab"), error);
  assertEquals(angular.validator.url("http://server:123/path"), null);
};

ValidatorTest.prototype.testEmail = function() {
  var error = "Email needs to be in username@host.com format.";
  assertEquals(error, angular.validator.email("ab"));
  assertEquals(null, angular.validator.email("misko@hevery.com"));
};

ValidatorTest.prototype.testJson = function() {
  assertNotNull(angular.validator.json("'"));
  assertNotNull(angular.validator.json("''X"));
  assertNull(angular.validator.json("{}"));
};

describe('Validator:asynchronous', function(){
  var asynchronous = angular.validator.asynchronous;
  var self;
  var value, fn;
  
  beforeEach(function(){
    value = null;
    fn = null;
    self = {
        $element:$('<input />')[0],
        $invalidWidgets:[],
        $updateView: noop
    };
  });
  
  it('should make a request and show spinner', function(){
    var x = compile('<input name="name" ng-validate="asynchronous:asyncFn"/>')
    var asyncFn = function(v,f){value=v; fn=f};
    var input = x.node.find(":input");
    x.scope.set("asyncFn", asyncFn);
    x.scope.set("name", "misko");
    x.binder.updateView();
    expect(value).toEqual('misko');
    expect(input.hasClass('ng-input-indicator-wait')).toBeTruthy();
    fn("myError");
    expect(input.hasClass('ng-input-indicator-wait')).toBeFalsy();
    expect(input.attr('ng-error')).toEqual("myError");
  });
  
  it("should not make second request to same value", function(){
    asynchronous.call(self, "kai", function(v,f){value=v; fn=f;});
    expect(value).toEqual('kai');
    expect(self.$invalidWidgets).toEqual([self.$element]);
    
    var spy = jasmine.createSpy();
    asynchronous.call(self, "kai", spy);
    expect(spy).wasNotCalled();
    
    asynchronous.call(self, "misko", spy);
    expect(spy).wasCalled();    
  });
  
  it("should ignore old callbacks, and not remove spinner", function(){
    var firstCb, secondCb;
    asynchronous.call(self, "first", function(v,f){value=v; firstCb=f;});
    asynchronous.call(self, "second", function(v,f){value=v; secondCb=f;});
    
    firstCb();
    expect($(self.$element).hasClass('ng-input-indicator-wait')).toBeTruthy();
    
    secondCb();
    expect($(self.$element).hasClass('ng-input-indicator-wait')).toBeFalsy();
  });
});