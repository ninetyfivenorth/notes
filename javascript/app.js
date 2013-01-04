// Generated by CoffeeScript 1.4.0
(function() {
  var OSName, fs, gui, home_dir, ncp, node, path, storage_dir;

  try {
    gui = require('nw.gui');
    fs = require('fs');
    path = require('path');
    ncp = require('ncp').ncp;
    OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") !== -1) {
      OSName = "Windows";
    }
    if (navigator.appVersion.indexOf("Mac") !== -1) {
      OSName = "Mac";
    }
    if (navigator.appVersion.indexOf("X11") !== -1) {
      OSName = "UNIX";
    }
    if (navigator.appVersion.indexOf("Linux") !== -1) {
      OSName = "Linux";
    }
    node = true;
    home_dir = process.env.HOME;
    if (OSName === "Mac") {
      storage_dir = path.join(home_dir, "/Library/Application Support/Noted/");
    }
    if (OSName === "Windows") {
      storage_dir = path.join(process.env.LOCALAPPDATA, "/Noted");
    }
    if (OSName === "Linux") {
      storage_dir = path.join(home_dir, "/.config/Noted/");
    }
  } catch (_error) {}

  window.noted = {
    selectedList: "Getting Started",
    selectedNote: "",
    setupPanel: function() {
      var win;
      win = gui.Window.get();
      win.show();
      win.showDevTools();
      $('#close').click(function() {
        return win.close();
      });
      $('#minimize').click(function() {
        return win.minimize();
      });
      $('#maximize').click(function() {
        return win.maximize();
      });
      $('#panel').mouseenter(function() {
        return $('#panel').addClass('drag');
      });
      $('#panel #decor img, #panel #noteControls img, #panel #search').mouseenter(function() {
        return $('#panel').removeClass('drag');
      });
      $('#panel #decor img, #panel #noteControls img, #panel #search').mouseleave(function() {
        return $('#panel').addClass('drag');
      });
      return $('#panel').mouseleave(function() {
        return $('#panel').removeClass('drag');
      });
    },
    setupUI: function() {
      $("#content header .edit").click(function() {
        if ($(this).text() === "save") {
          $(this).text("edit");
          $('.headerwrap .left h1').attr('contenteditable', 'false');
          window.noted.loadNotes(window.noted.selectedList);
          return window.noted.editor.preview();
        } else {
          $(this).text("save");
          $('.headerwrap .left h1').attr('contenteditable', 'true');
          return window.noted.editor.edit();
        }
      });
      $("body").on("click", "#notebooks li", function() {
        $(this).parent().find(".selected").removeClass("selected");
        $(this).addClass("selected");
        return window.noted.loadNotes($(this).text());
      });
      $("body").on("click", "#notes li", function() {
        $("#notes .selected").removeClass("selected");
        $(this).addClass("selected");
        return window.noted.loadNote($(this).find("h2").text());
      });
      $("body").on("keydown", ".headerwrap .left h1", function(e) {
        if (e.keyCode === 13) {
          e.preventDefault();
          $(this).blur();
        }
        if ($(this).text() !== "") {
          $("#notes [data-id='" + window.noted.selectedNote + "']").attr("data-id", $(this).text()).find("h2").text($(this).text());
          fs.rename(path.join(storage_dir, "Notebooks", window.noted.selectedList, window.noted.selectedNote + '.txt'), path.join(storage_dir, "Notebooks", window.noted.selectedList, $(this).text() + '.txt'));
          return window.noted.selectedNote = $(this).text();
        }
      });
      window.noted.editor = new EpicEditor({
        container: 'contentbody',
        theme: {
          base: '/themes/base/epiceditor.css',
          preview: '/themes/preview/style.css',
          editor: '/themes/editor/style.css'
        }
      });
      return window.noted.editor.load();
    },
    render: function() {
      return fs.readdir(path.join(storage_dir, "Notebooks"), function(err, data) {
        return window.noted.listNotebooks(data);
      });
    },
    listNotebooks: function(data) {
      var i;
      i = 0;
      while (i < data.length) {
        if (fs.statSync(path.join(storage_dir, "Notebooks", data[i])).isDirectory()) {
          $("#notebooks ul").append("<li data-id='" + data[i] + "'>" + data[i] + "</li>");
        }
        i++;
      }
      return $("#notebooks [data-id='" + window.noted.selectedList + "']").addClass("selected").trigger("click");
    },
    loadNotes: function(name) {
      $("#notes header h1").html(name);
      $("#notes ul").html("");
      return fs.readdir(path.join(storage_dir, "Notebooks", name), function(err, data) {
        var i, _results;
        i = 0;
        _results = [];
        while (i < data.length) {
          if (data[i].substr(data[i].length - 4, data[i].length) === ".txt") {
            name = data[i].substr(0, data[i].length - 4);
            $("#notes ul").append("<li data-id='" + name + "'><h2>" + name + "</h2><time></time></li>");
          }
          _results.push(i++);
        }
        return _results;
      });
    },
    loadNote: function(name) {
      window.noted.selectedNote = name;
      return fs.readFile(path.join(storage_dir, "Notebooks", window.noted.selectedList, name + '.txt'), 'utf-8', function(err, data) {
        if (err) {
          throw err;
        }
        $('.headerwrap .left h1').text(name);
        window.noted.editor.importFile('file', data);
        return window.noted.editor.preview();
      });
    }
  };

  $(function() {
    if (node) {
      window.noted.setupPanel();
    }
    window.noted.setupUI();
    if (node) {
      return fs.readdir(path.join(storage_dir, "/Notebooks/"), function(err, data) {
        if (err) {
          if (err.code === "ENOENT") {
            return fs.mkdir(path.join(storage_dir, "/Notebooks/"), function() {
              return ncp(path.join(window.location.pathname, "../default_notebooks"), path.join(storage_dir, "/Notebooks/"), function(err) {
                return window.noted.render();
              });
            });
          }
        } else {
          return window.noted.render();
        }
      });
    }
  });

}).call(this);
