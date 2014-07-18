define(function() {

  var metaData =      ko.observable(),
      pages =         ko.observableArray([]),
      table =         ko.observableArray([]),
      hasTutorial =   ko.observable(false),
      page =          ko.observable(null),
      index =         ko.observable(null);

    // NOTE:
    // Enclosing the state in the service, to use it in both Plugin and Panel

    var gotoPage = function(id){
      window.location.hash = "#tutorial/"+id
    }
    var gotoPrevPage = function(){
      if(!noPrevPage()) gotoPage(index()-1);
    }
    var gotoNextPage = function(){
      if(!noNextPage()) gotoPage(index()!=null?index()+1:0);
    }
    var noPrevPage  = ko.computed(function(){
      return index() == 0;
    });
    var noNextPage  = ko.computed(function(){
      return index() == table().length-1;
    });

  // TODO = put real tutoial link
  // TODO = provide JSON route, for meta-datas
  $.get("/assets/fake/tutorial.json", function(data){
    metaData(data.metaData);
    hasTutorial(true);
    // parseHTML dumps the <html> <head> and <body> tags
    // so we'll get a list with <title> some <div> and some text nodes
    var htmlNodes = $.parseHTML(data.html),
        _pages = [],
        _table = [];
    $(htmlNodes).filter("div").each(function(i,el){
      $("a", el).each(function(j, link) {
        // Open external links in new window.
        if (link.getAttribute('href').indexOf("http://") == 0 && !link.target){
          link.target = "_blank";
        // Force shorcut class on links to code
        } else if (link.getAttribute('href').indexOf("#code/") == 0){
          $(link).addClass("shorcut");
        }
      });
      var title = $("h2", el).remove().html() || $(el).text().substring(0,40) + "...";
      _pages.push({ index: i, title: title, page: el.innerHTML });
      _table.push(title);
    });
    pages(_pages);
    table(_table);
  });

  return {
    hasTutorial:  hasTutorial,
    metaData:     metaData,
    table:        table,
    pages:        pages,
    page:         page,
    index:        index,
    gotoPrevPage: gotoPrevPage,
    gotoNextPage: gotoNextPage,
    noPrevPage:   noPrevPage,
    noNextPage:   noNextPage
  }

});
