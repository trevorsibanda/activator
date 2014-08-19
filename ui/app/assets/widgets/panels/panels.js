/*
 Copyright (C) 2014 Typesafe, Inc <http://typesafe.com>
 */
define([
  'commons/settings',
  "text!./panels.html",
  "css!./panels"
], function(
  settings,
  template
){

  // Find the plugins who have panels
  // var panels = plugins.plugins.reduce(function(list, group) {
  //   return list.concat(group.links.filter(function(it) {
  //     return it.panel;
  //   }));
  // }, []);
  var panels = ['plugins/tutorial/tutorialPanel'];

  currentPanel = ko.observable();

  var panelOpened = settings.observable("app.panelOpened", true);
  var panelShape = settings.observable("app.panelShape", "right1");
  var dropdownActive = ko.observable(false);

  var switchPanel = function(panel) {
    require([panel], function(p) {
      $("#panelWrapper").replaceWith(p.render());
      currentPanel(panel);
    });
  }
  var toggle = function() {
    panelOpened(!panelOpened());
  }
  var toggleShape = function(data, event){
    panelShape(event.target.dataset.panelShape);
    dropdownActive(false);
  }
  var toggleDropdown = function(data, event){
    event.stopPropagation();
    dropdownActive(!dropdownActive());
  }


  var PanelState = {
    panelOpened: panelOpened,
    panelShape: panelShape,
    panels: panels,
    currentPanel: currentPanel,
    switchPanel: switchPanel,
    toggle: toggle,
    toggleShape: toggleShape,
    toggleDropdown: toggleDropdown
  };

  // Default panel:
  setTimeout(function() {
    PanelState.switchPanel(panels[0]);
  },100);

  return {
    render: function() {
      return ko.bindhtml(template, PanelState)
    },
    state: PanelState
  }

});
