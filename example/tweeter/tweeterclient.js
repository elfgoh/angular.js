function noop(){}
$(document).ready(function(){
  var scope = window.scope = angular.compile(document, {
    location:angular.startUrlWatcher()
  });
  scope.getJSON = function(url, callback) {
    var list = [];
    var self = this;
    self.set('status', 'fetching');
    $.getJSON(url, function(response, code){
      _(response).forEach(function(v,k){
        list[k] = v;
      });
      (callback||noop)(response);
      self.set('status', '');
      self.updateView();
    });
    return list;
  };

  function fetchTweets(username){
    return scope.getJSON(
        username ?
            "http://twitter.com/statuses/user_timeline/"+username+".json" :
            "http://twitter.com/statuses/home_timeline.json");
  }

  scope.set('fetchTweets', fetchTweets);
  scope.set('users', [
      {screen_name:'mhevery', name:'Mi\u0161ko Hevery', 
       notes:'Author of <angular/> http://www.getangular.com.', 
       profile_image_url:'http://a3.twimg.com/profile_images/54360179/Me_-_Small_Banner_normal.jpg'},
      {screen_name:'abrons', name:'Adam Abrons', 
       notes:'Author of <angular/> & Ruby guru see:  http://www.angularjs.org.', 
       profile_image_url:'http://media.linkedin.com/mpr/mpr/shrink_80_80/p/2/000/005/0a8/044278d.jpg'}
    ]);
  scope.init();
});