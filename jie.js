var jie = {
  'start': function() {
    var item;
    jie['top-bar-start']();
    jie['tool-box-start']();
    jie['nav-box-start']();
    jie['layer-box-start']();
    jie['window-start']();
    document.body.addEventListener('mousemove', jie['mouse-move']);
    document.body.addEventListener('mouseup', jie['mouse-up']);
    document.body.addEventListener('mouseleave', jie['mouse-up']);
    document.querySelector('.overlay').classList.remove('opaque');
    document.querySelector('.overlay').classList.add('hidden');
  },
  'color-change': function() {
    if (jie['color-current-element']) {
      var color = document.getElementById('cp1_Hex').value;
      jie['color-to-element'](jie['color-current-element'], color);
    }
  },
  'color-click': function() {
    jie['color-current-element'] = this;
    var picker = document.querySelector('.color-picker');
    var hidden = picker.classList.contains('hidden');
    var color = this.dataset.color;
    if (hidden) {
      jie['color-picker-show'].call(this);
    } else if (color == document.getElementById('cp1_Hex').value) {
      jie['color-picker-hide']();
    }
    jie['color-set'](color);
  },
  'color-last-click': function() {
    var color = this.dataset.color;
    jie['color-set'](color);
  },
  'color-to-element': function(el, color) {
    el.style.background = '#' + color;
    el.dataset.color = color;
  },
  'color-set': function(color) {
    jie['color-to-element'](document.getElementById('cp1_Last'), color);
    document.getElementById('cp1_Hex').value = color;
    jie['color-picker']._cvp.setValuesFromHex();
    jie['color-picker'].positionMapAndSliderArrows();
    jie['color-picker'].updateVisuals();
    jie['color-picker'].mapValueChanged()
  },
  'color-picker-hide': function() {
    var item;
    document.querySelector('.color-picker').classList.add('hidden');
    var pickerImgs = document.querySelectorAll('body > img');
    for (item of pickerImgs)
      item.classList.add('hidden');
  },
  'color-picker-show': function() {
    var item;
    var color = this.dataset.color;
    jie['color-set'](color);
    document.querySelector('.color-picker').classList.remove('hidden');
    var pickerImgs = document.querySelectorAll('body > img');
    for (item of pickerImgs)
      item.classList.remove('hidden');
  },
  'focus': function() {
    var savedTabIndex = this.getAttribute('tabindex');
    this.setAttribute('tabindex', '-1');
    this.focus();
    this.setAttribute('tabindex', savedTabIndex);
  },
  'get-index': function(el) {
    return [].slice.call(el.parentElement.children).indexOf(el);
  },
  'history-action-selected': function(event) {
    var action = this;
    if (!action.classList.contains('selected')) {
      jie['history-clear-selection']();
      action.classList.add('selected');
      var list = jie['query-up'](action, '.history-list');
      var column = list.parentElement;
      column.scrollTop = action.offsetTop - action.offsetHeight;
      var win = document.querySelector('.window.image.selected');
      jie['window-clear-content'](win);
      jie['layer-clear-content']();
      var layerList = document.querySelector('.layer-list[data-id=' + win.id + ']');
      for (var i = 0; i < action.imagedata.length; i++) {
        var jimpImage = action.imagedata[i].img;
        var layerName = action.imagedata[i].name;
        var opacity = action.imagedata[i].opacity;
        var img = document.createElement('img');
        jie['layer-add'](win, img, layerList, layerList.firstElementChild, layerName, opacity);
        jie['jimpImage-to-img'].call(img, null, jimpImage.clone(), jie['history-update-callback']);
      }
    }
  },
  'history-update-callback': function() {
    var img = this;
    var scale = document.querySelector('.zoom-input').value / 100;
    img.style.transform = 'scale(' + scale + ')';
    img.dataset.scale = scale;
    var layer = jie['img-get-layer'](img);
    var win = jie['query-up'](img, '.window');
    jie['thumb-update'](layer.querySelector('.layer-preview'), win, jie['get-index'](img));
  },
  'history-add-action': function(text, win) {
    var action = jie['history-create-action'](text);
    var list = document.querySelector('.history-list[data-id=' + win.id + ']');
    var selectedAction = list.querySelector('.history-action.selected');
    if (selectedAction) {
      var selectedActionIndex = jie['get-index'](selectedAction);
      var actionsAfterSelected = list.childElementCount - selectedActionIndex - 1;
      if (actionsAfterSelected) {
        var actions = list.children;
        while (selectedActionIndex + 1 < list.childElementCount) {
          var a = actions[list.childElementCount - 1];
          a.remove();
        }
      }
    }
    jie['history-clear-selection']();
    list.appendChild(action);
    var column = list.parentElement;
    column.scrollTop = column.scrollHeight;
    var preview = action.querySelector('.history-preview');
    var data = [];
    var imgs = win.querySelectorAll('img');
    var layers = document.querySelectorAll('.layer-list.current .layer');
    var i = imgs.length;
    for (var img of imgs) {
      i--;
      data.push({
        name: layers[i].querySelector('.layer-name').textContent,
        img: img.jimpImage.clone(),
        opacity: layers[i].dataset.opacity
      });
    }
    action.imagedata = data;
    jie['thumb-update'](preview, win);
    return action;
  },
  'history-clear-selection': function() {
    var action = document.querySelector('.history-list.current .history-action.selected');
    if (action)
      action.classList.remove('selected');
  },
  'history-create-list': function(img, win) {
    var list = document.createElement('div');
    list.classList = 'history-list current';
    list.dataset.id = win.id;
    var action = jie['history-create-action']('Open', 'locked');
    action.imagedata = [{
      name: 'Layer 1',
      img: img.jimpImage.clone()
    }];
    list.appendChild(action);
    document.querySelector('.history-column').appendChild(list);
    jie['history-list-update'](win);
    jie['thumb-update'](action.querySelector('.history-preview'), win);
  },
  'history-create-action': function(text, locked) {
    var action = document.createElement('div');
    action.classList = 'history-action item selected';
    action.addEventListener('click', jie['history-action-selected']);
    var preview = document.createElement('div');
    preview.className = 'history-preview';
    action.appendChild(preview);
    var trans = document.createElement('div');
    trans.className = 'transparent-pattern';
    preview.appendChild(trans);
    var thumb = document.createElement('div');
    thumb.className = 'history-thumb';
    trans.appendChild(thumb);
    var name = document.createElement('span');
    name.className = 'history-name';
    name.textContent = text;
    action.appendChild(name);
    if (locked) {
      var lock = document.createElement('span');
      lock.title = 'Lock Layer';
      lock.className = 'history-lock fa fa-lock';
      action.appendChild(lock);
    }
    return action;
  },
  'history-list-update': function(win) {
    var oldList = document.querySelector('.current.history-list');
    if (oldList) {
      oldList.classList.add('hidden');
      oldList.classList.remove('current');
    }
    var list = document.querySelector('.history-list[data-id=' + win.id + ']');
    list.classList.remove('hidden');
    list.classList.add('current');
  },
  'image-create-new': function() {
    jie['window-hide-pops']();
    var image = {
      name: document.querySelector('.new-image .image-name').value,
      width: Math.round(document.querySelector('.new-image .width').value),
      height: Math.round(document.querySelector('.new-image .height').value),
      transparent: document.querySelector('.new-image .transparent input').checked,
      color: 0xFFFFFFFF
    };
    if (image.transparent)
      image.color = 0x00000000;
    var img = document.createElement('img');
    img.name = image.name;
    image.img = img;
    var jimpCb = jie['jimpImage-to-img'].bind(img);
    new Jimp(image.width,image.height,image.color,jimpCb);
    img.addEventListener('load', function(event) {
      event.target.removeEventListener(event.type, arguments.callee);
      jie['window-image-create'](image, img);
    });
  },
  'image-create-url': function() {
    jie['window-hide-pops']();
    var url = document.querySelector('.open-url .image-url').value;
    var img = document.createElement('img');
    img.addEventListener('load', jie['url-load']);
    img.addEventListener('error', jie['url-error']);
    var path = url.split('/');
    img.name = path[path.length - 1];
    img.src = url;
  },
  'image-download': function() {
    // jimp.opacity
    // jimp.composite
    jie['window-hide-pops']();
    var img = document.querySelector('.window.image.selected img.current');
    jie['image-output-handler'].href = img.src;
    jie['image-output-handler'].download = img.name;
    jie['image-output-handler'].click();
  },
  'image-flip': function(win, horizontal, vertical) {
    var layers = document.querySelectorAll('.layer-list[data-id=' + win.id + '] .layer');
    for (var layer of layers) {
      jie['layer-flip'](layer, horizontal, vertical);
    }
  },
  'image-id-chars': 'ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxz'.split(''),
  'image-id-new': function() {
    var id = '';
    for (var i = 0; i < 32; i++) {
      id += jie['image-id-chars'][Math.floor(Math.random() * jie['image-id-chars'].length)]
    }
    return id;
  },
  'image-input-load': function() {
    var img = this;
    event.target.removeEventListener(event.type, arguments.callee);
    var image = {
      name: img.name,
      width: img.width,
      height: img.height
    };
    var win = jie['window-image-create'](image, img);
  },
  'image-input-read': function() {
    var input = this;
    var file = input.files[0];
    if (file) {
      var reader = new FileReader();
      reader.addEventListener('load', function(event) {
        input.value = '';
        var img = document.createElement('img');
        img.name = file.name;
        img.src = event.target.result;
        img.addEventListener('load', jie['image-input-load']);
        img.addEventListener('load', jie['nav-thumb-load']);
      });
      reader.readAsDataURL(file);
    }
  },
  'image-save-format-change': function() {
    var formats = document.querySelector('.save-image .save-formats');
    var nocompress = (this.value.search('compression') < 0);
    var quality = document.querySelector('.save-image .save-quality');
    quality.classList.toggle('hidden', nocompress);
    var opaque = (this.value.search('transparency') < 0);
    var trans = document.querySelector('.save-image .transparent-pattern');
    trans.classList.toggle('opaque', opaque);
  },
  'image-new-preset-change': function() {
    var presets = document.querySelector('.new-presets');
    var a = presets.value.split(' ');
    document.querySelector('.new-image .width').value = a[0];
    document.querySelector('.new-image .height').value = a[2];
  },
  'image-update-callback': function() {
    var img = this;
    var layer = jie['img-get-layer'](img);
    var win = jie['query-up'](img, '.window');
    jie['thumb-update'](layer.querySelector('.layer-preview'), win, jie['get-index'](img));
    jie['thumb-update'](document.querySelector('.nav-preview'), win);
    jie['thumb-update'](document.querySelector('.selected.history-action .history-preview'), win);
  },
  'img-get-layer': function(img) {
    var win = jie['query-up'](img, '.window');
    var id = win.id;
    var list = document.querySelector('.layer-list[data-id=' + id + ']').children;
    var imgIndex = jie['get-index'](img);
    var layerIndex = list.length - imgIndex;
    var layer = list[layerIndex - 1];
    return layer;
  },
  'jimpImage-to-img': function(error, jimpImage, cb) {
    var img = this;
    var jimpcallback = function(error, data) {
      img.src = data;
    };
    if (cb) {
      jimpcallback = function(error, data) {
        img.addEventListener('load', cb);
        img.src = data;
      }
    }
    img.jimpImage = jimpImage;
    var mime = jimpImage.getMIME();
    jimpImage.getBase64(mime, jimpcallback);
  },
  'jimpImage-create': function(img, cb) {
    Jimp.read(img.src, function(error, jimpImage) {
      if (error) {
        alert('Error loading image');
        var win = jie['query-up'](img, '.window');
        if (win)
          win.remove();
      } else
        img.jimpImage = jimpImage;
      if (cb)
        cb();
    });
  },
  'layer-add': function(win, img, list, before, layerName, opacity) {
    var layer = jie['layer-create-new'](img, layerName);
    list.insertBefore(layer, before);
    jie['layer-clear-selection']();
    layer.classList.add('selected');
    jie['window-add-img'](win, img);
    var imgIndex = jie['get-index'](img);
    var preview = layer.querySelector('.layer-preview');
    jie['thumb-update'](preview, win, imgIndex);
    jie['layer-opacity-update'](opacity || 100, layer);
  },
  'layer-box-start': function() {
    document.querySelector('.layer-new').addEventListener('click', jie['layer-new']);
    document.querySelector('.layer-duplicate').addEventListener('click', jie['layer-duplicate']);
    document.querySelector('.layer-move-up').addEventListener('click', jie['layer-move-up']);
    document.querySelector('.layer-move-down').addEventListener('click', jie['layer-move-down']);
    document.querySelector('.layer-delete').addEventListener('click', jie['layer-delete']);
    document.querySelector('.layer-opacity-range').addEventListener('input', jie['layer-opacity-change']);
    document.querySelector('.layer-opacity-input').addEventListener('input', jie['layer-opacity-change']);
    document.querySelector('.layer-bar').addEventListener('wheel', jie['layer-opacity-scroll']);
  },
  'layer-selected': function() {
    var layer = this;
    jie['layer-clear-selection']();
    layer.classList.add('selected');
    jie['layer-opacity-update'](layer.dataset.opacity);
    var img = jie['layer-get-img'](layer);
    img.classList.add('current');
    var column = jie['query-up'](layer, '.layer-column');
    column.scrollTop = layer.offsetTop - layer.offsetHeight;
  },
  'layer-create-list': function(img, win) {
    var oldList = document.querySelector('.layer-list.current');
    if (oldList) {
      oldList.classList.add('hidden');
      oldList.classList.remove('current');
    }
    var column = document.querySelector('.layer-column');
    var list = document.createElement('div');
    list.className = 'layer-list current';
    list.dataset.id = win.id;
    column.appendChild(list);
    jie['layer-add'](win, img, list, list.querySelector('.selected'));
  },
  'layer-clear-content': function() {
    var container = document.querySelector('.current.layer-list');
    if (container)
      container.innerHTML = '';
  },
  'layer-clear-selection': function() {
    var layer = document.querySelector('.current.layer-list .selected.layer');
    if (layer) {
      layer.classList.remove('selected');
      var img = jie['layer-get-img'](layer);
      img.classList.remove('current');
    }
  },
  'layer-create-new': function(img, layerName) {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      img.classList.add('current');
      var list = document.querySelector('.layer-list[data-id=' + win.id + ']');
      var layer = document.createElement('div');
      layer.classList = 'layer item';
      layer.addEventListener('click', jie['layer-selected']);
      layer.dataset.opacity = img.dataset.opacity || 100;
      var hide = document.createElement('input');
      hide.type = 'checkbox';
      hide.checked = true;
      hide.className = 'layer-hide';
      hide.addEventListener('change', jie['layer-hide']);
      var trans = document.createElement('div');
      trans.className = 'transparent-pattern';
      var preview = document.createElement('div');
      preview.className = 'layer-preview';
      var name = document.createElement('span');
      preview.appendChild(trans);
      name.addEventListener('click', jie['layer-edit-name']);
      name.className = 'layer-name';
      name.textContent = layerName || 'Layer ' + (list.childElementCount + 1);
      var nameWrapper = document.createElement('div');
      nameWrapper.className = 'layer-name-wrapper';
      nameWrapper.appendChild(name);
      var lock = document.createElement('span');
      lock.title = 'Lock Layer';
      lock.className = 'layer-lock fa fa-unlock-alt';
      layer.appendChild(hide);
      layer.appendChild(preview);
      layer.appendChild(nameWrapper);
      layer.appendChild(lock);
      return layer;
    }
  },
  'layer-edit-name': function() {
    this.contentEditable = true;
  },
  'layer-delete': function() {
    var layer = document.querySelector('.current.layer-list .selected.layer');
    if (layer && layer.parentElement.childElementCount > 1) {
      var img = jie['layer-get-img'](layer);
      var win = jie['query-up'](img, '.window');
      layer.remove();
      img.remove();
      layer = document.querySelector('.current.layer-list .layer');
      if (layer)
        layer.classList.add('selected');
      img = jie['layer-get-img'](layer);
      img.classList.add('current');
      jie['history-add-action']('Delete Layer', win);
    }
  },
  'layer-duplicate': function() {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var layer = document.querySelector('.current.layer-list .selected.layer');
      var name = layer.querySelector('.layer-name').textContent + ' Clone';
      var img = jie['layer-get-img'](layer);
      cloneImg = img.cloneNode();
      cloneImg.jimpImage = img.jimpImage.clone();
      var list = document.querySelector('.current.layer-list');
      jie['layer-add'](win, cloneImg, list, list.querySelector('.selected'), name ,img.dataset.opacity);
      jie['history-add-action']('Duplicate Layer', win);
    }
  },
  'layer-flip': function(layer, horizontal, vertical) {
    var img = jie['layer-get-img'](layer);
    img.jimpImage.flip(horizontal, vertical);
    jie['jimpImage-to-img'].call(img, null, img.jimpImage, jie['image-update-callback']);
  },
  'layer-get-img': function(layer) {
    var id = layer.parentElement.dataset.id;
    var win = document.getElementById(id);
    var list = layer.parentElement.children;
    var layerIndex = jie['get-index'](layer);
    var imgIndex = list.length - layerIndex;
    var img = win.querySelector('img:nth-child(' + imgIndex + ')');
    return img;
  },
  'layer-hide': function() {
    var hide = this;
    var layer = jie['query-up'](hide, '.layer');
    var img = jie['layer-get-img'](layer);
    img.classList.toggle('hidden', !hide.checked);
  },
  'layer-opacity-change': function() {
    var opacity = Math.floor(this.value);
    jie['layer-opacity-update'](opacity);
  },
  'layer-opacity-update': function(opacity, layer) {
    opacity = Math.min(opacity, 100);
    opacity = Math.max(opacity, 0);
    if (!layer)
      layer = document.querySelector('.current.layer-list .selected.layer');
    if (layer) {
      layer.dataset.opacity = opacity;
      var img = jie['layer-get-img'](layer);
      if (img) {
        var f = opacity / 100;
        img.style.opacity = f;
        img.dataset.opacity = opacity;
      }
    }
    var range = document.querySelector('.layer-opacity-range');
    range.value = opacity;
    var input = document.querySelector('.layer-opacity-input');
    input.value = opacity;
  },
  'layer-opacity-scroll': function() {
    var layer = document.querySelector('.current.layer-list .selected.layer');
    var opacity = Math.floor(document.querySelector('.layer-opacity-input').value);
    var f = 5
      , w = 1;
    if (event.deltaY > 0) {
      w = -1;
    }
    f *= w;
    opacity = Math.round(opacity + f);
    jie['layer-opacity-update'](opacity);
  },
  'layer-new': function() {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var img = win.querySelector('img.current');
      var newImg = document.createElement('img');
      newImg.addEventListener('load', jie['layer-load-new-image']);
      var cb = jie['jimpImage-to-img'].bind(newImg);
      newImg.jimpImage = new Jimp(img.width,img.height,0x00000000,cb);
    }
  },
  'layer-load-new-image': function() {
    var img = this;
    event.target.removeEventListener(event.type, arguments.callee);
    var win = document.querySelector('.window.image.selected');
    var list = document.querySelector('.current.layer-list');
    jie['layer-add'](win, img, list, list.querySelector('.selected'));
    jie['history-add-action']('New Layer', win);
  },
  'layer-move-down': function() {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var layer = document.querySelector('.current.layer-list .selected.layer');
      var img = jie['layer-get-img'](layer);
      var nextLayer = layer.nextSibling;
      var prevImg = img.previousSibling;
      if (nextLayer && prevImg) {
        nextLayer.after(layer);
        prevImg.before(img);
        jie['history-add-action']('Move Layer Down', win);
      }
    }
  },
  'layer-move-up': function() {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var layer = document.querySelector('.current.layer-list .selected.layer');
      var img = jie['layer-get-img'](layer);
      if (layer && img) {
        var prevLayer = layer.previousSibling;
        var nextImg = img.nextSibling;
        if (prevLayer && nextImg) {
          prevLayer.before(layer);
          nextImg.after(img);
          jie['history-add-action']('Move Layer Up', win);
        }
      }
    }
  },
  'layer-list-update': function(win) {
    var oldList = document.querySelector('.current.layer-list');
    if (oldList) {
      oldList.classList.add('hidden');
      oldList.classList.remove('current');
    }
    var list = document.querySelector('.layer-list[data-id=' + win.id + ']');
    list.classList.remove('hidden');
    list.classList.add('current');
    var layer = list.querySelector('.current');
    if (layer)
      jie['layer-opacity-update'](layer);
  },
  'mouse-down-drag-start': function(event) {
    if (!event.target.classList.contains('close-window')) {
      var win = this.parentElement;
      var offset = {
        x: event.offsetX,
        y: event.offsetY
      };
      var el = event.target;
      while (el.parentElement !== win) {
        offset.x += el.offsetLeft;
        offset.y += el.offsetTop;
        el = el.parentElement;
      }
      jie['mouse-drag-data'] = {
        target: win,
        x: offset.x,
        y: offset.y
      };
    }
  },
  'mouse-down-image': function(event) {
    if (!event.target.classList.contains('tool-handler')) {
      var img = this;
      var container = jie['query-up'](img, '.window-container');
      jie['mouse-pan-data'] = {
        target: img,
        ex: event.clientX,
        ey: event.clientY,
        x: container.scrollLeft,
        y: container.scrollTop
      };
      jie['mouse-move-image'].call(this, event);
    }
  },
  'mouse-move-image': function(event) {
    var img = this
      , data = {
      x: event.offsetX + 1,
      y: event.offsetY + 1,
      w: img.width,
      h: img.height,
      r: '',
      g: '',
      b: '',
      a: ''
    };
    if (img.jimpImage) {
      img.jimpImage.scan(event.offsetX, event.offsetY, 1, 1, function(sx, sy, index) {
        data.r = img.jimpImage.bitmap.data[index + 0];
        data.g = img.jimpImage.bitmap.data[index + 1];
        data.b = img.jimpImage.bitmap.data[index + 2];
        data.a = img.jimpImage.bitmap.data[index + 3];
      });
    }
    jie['nav-set-info'](data);
    if (jie['mouse-pan-data']) {
      var container = jie['query-up'](img, '.window-container');
      container.scrollLeft = jie['mouse-pan-data'].ex - event.clientX + jie['mouse-pan-data'].x;
      container.scrollTop = jie['mouse-pan-data'].ey - event.clientY + jie['mouse-pan-data'].y;
    }
    var container = jie['query-up'](img, '.window-container');
    jie['mouse-zoom-data'] = {
      ex: event.clientX,
      ey: event.clientY,
      x: container.scrollLeft,
      y: container.scrollTop
    };
  },
  'mouse-move': function(event) {
    var x = event.clientX
      , y = event.clientY;
    if (jie['mouse-drag-data']) {
      x -= jie['mouse-drag-data'].x;
      y -= jie['mouse-drag-data'].y;
      y = Math.max(y, 50);
      jie['mouse-drag-data'].target.style.left = x + 'px';
      jie['mouse-drag-data'].target.style.top = y + 'px';
    }
    if (jie['mouse-resize-data']) {
      x -= jie['mouse-resize-data'].target.offsetLeft;
      y -= jie['mouse-resize-data'].target.offsetTop;
      x = Math.max(x, 100);
      y = Math.max(y, 100);
      jie['mouse-resize-data'].target.style.width = x + 'px';
      jie['mouse-resize-data'].target.style.height = y + 'px';
    }
  },
  'mouse-resize-start': function(event) {
    jie['mouse-resize-data'] = {
      target: this.parentElement
    };
  },
  'mouse-up': function(event) {
    var item;
    jie['mouse-drag-data'] = undefined;
    jie['mouse-resize-data'] = undefined;
    jie['mouse-pan-data'] = undefined;
    if (!event.target.classList.contains('layer-name')) {
      var layerNames = document.querySelectorAll('.layer-name');
      for (item of layerNames)
        item.contentEditable = false;
    }
  },
  'nav-box-start': function() {
    document.querySelector('.zoom-range').addEventListener('input', jie['zoom-change']);
    document.querySelector('.zoom-input').addEventListener('input', jie['zoom-change']);
    document.querySelector('.nav-preview').addEventListener('wheel', jie['zoom-scroll']);
    document.querySelector('.nav-box .zoom').addEventListener('wheel', jie['zoom-scroll']);
    jie['nav-update']();
  },
  'nav-thumb-load': function(event) {
    var win = jie['query-up'](this, '.window');
    jie['thumb-update'](document.querySelector('.nav-preview'), win);
  },
  'nav-update': function(win) {
    var zoom = 100, img;
    if (win) {
      img = win.querySelector('img.current');
      if (img && img.dataset.scale)
        zoom = 100 * img.dataset.scale;
    }
    jie['zoom-reset']();
    jie['thumb-update'](document.querySelector('.nav-preview'), win);
  },
  'nav-set-info': function(data) {
    document.querySelector('.nav-box .info-x').textContent = data.x;
    document.querySelector('.nav-box .info-y').textContent = data.y;
    document.querySelector('.nav-box .info-w').textContent = data.w;
    document.querySelector('.nav-box .info-h').textContent = data.h;
    document.querySelector('.nav-box .info-r').textContent = data.r;
    document.querySelector('.nav-box .info-g').textContent = data.g;
    document.querySelector('.nav-box .info-b').textContent = data.b;
    document.querySelector('.nav-box .info-a').textContent = data.a;
  },
  'prevent-event': function() {
    event.preventDefault();
  },
  'query-up': function(element, selector) {
    var el = element
      , match = el.matches(selector);
    while (el.parentElement && !match) {
      el = el.parentElement;
      match = el.matches(selector);
    }
    if (match)
      return el;
    else
      return false;
  },
  'set-size': function(el, size) {
    el.style.width = size.width + 'px';
    el.style.height = size.height + 'px';
  },
  'thumb-update': function(el, win, n) {
    // console.trace(el)
    var preview = el;
    var trans = preview.querySelector('.transparent-pattern');
    trans.innerHTML = '';
    var size = {
      w: preview.clientWidth,
      h: preview.clientHeight
    };
    var w = size.w, h = size.h, b;
    if (win) {
      var imgs = win.querySelectorAll('img')
        , img = imgs[n || 0];
      if (img.width > img.height) {
        w = size.w;
        h = Math.floor(img.height * size.h / img.width);
        preview.style.display = 'inline-block';
      } else {
        w = Math.floor(img.width * size.w / img.height);
        h = size.h;
        preview.style.display = 'flex';
      }
      var c = preview.className.split('-')[0] + '-thumb', thumb;
      if (n != undefined) {
        thumb = document.createElement('div');
        thumb.className = c;
        thumb.style['background-image'] = 'url(' + img.src + ')';
        thumb.style.width = w + 'px';
        thumb.style.height = h + 'px';
        thumb.style['background-size'] = w + 'px ' + h + 'px';
        trans.appendChild(thumb);
      } else {
        for (img of imgs) {
          thumb = document.createElement('div');
          thumb.className = c;
          thumb.style['background-image'] = 'url(' + img.src + ')';
          thumb.style.width = w + 'px';
          thumb.style.height = h + 'px';
          thumb.style['background-size'] = w + 'px ' + h + 'px';
          trans.appendChild(thumb);
        }
      }
    }
    trans.style.width = w + 'px';
    trans.style.height = h + 'px';
  },
  'tool-box-start': function() {
    document.querySelector('.current-color').addEventListener('click', jie['color-click']);
    document.querySelector('.last-color').addEventListener('click', jie['color-click']);
    document.querySelector('.color-ok').addEventListener('click', jie['color-picker-hide']);
    document.querySelector('.color-picker .close-window').addEventListener('click', jie['color-last-click'].bind(document.getElementById('cp1_Last')));
    document.getElementById('cp1_Last').addEventListener('click', jie['color-last-click']);
    jie['color-picker'] = new cp.ColorPicker('cp1',{
      startHex: '000000',
      startMode: 'h'
    });
    jie['color-picker-hide']();
  },
  'top-bar-start': function() {
    var item;
    var topbarMenus = document.querySelectorAll('.top-bar > div');
    for (item of topbarMenus)
      item.addEventListener('mouseover', jie['focus']);
    var topbarLinks = document.querySelectorAll('.top-bar [class*=menu] span');
    for (item of topbarLinks)
      item.addEventListener('click', jie['top-bar-' + item.parentElement.className + '.' + item.textContent]);
    jie['image-input-handler'] = document.createElement('input');
    jie['image-input-handler'].type = 'file';
    jie['image-input-handler'].addEventListener('change', jie['image-input-read']);
    jie['image-output-handler'] = document.createElement('a');
    document.querySelector('.new-presets').addEventListener('change', jie['image-new-preset-change']);
    document.querySelector('.create-new-image').addEventListener('click', jie['image-create-new']);
    document.querySelector('.create-url-image').addEventListener('click', jie['image-create-url']);
    document.querySelector('.save-formats').addEventListener('change', jie['image-save-format-change']);
    document.querySelector('.save-image-download').addEventListener('click', jie['image-download']);
  },
  'top-bar-menu-clear': function() {
    var menu = document.querySelector('.top-bar > div:focus');
    if (menu)
      menu.blur();
  },
  'top-bar-file-menu.New Image': function() {
    jie['top-bar-menu-clear']();
    jie['window-show-pop']('.new-image');
  },
  'top-bar-file-menu.Open Image': function() {
    jie['top-bar-menu-clear']();
    jie['image-input-handler'].click();
  },
  'top-bar-file-menu.Open URL': function() {
    jie['top-bar-menu-clear']();
    jie['window-show-pop']('.open-url');
  },
  'top-bar-file-menu.Save': function() {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      jie['top-bar-menu-clear']();
      jie['window-show-pop']('.save-image');
      var img = win.querySelector('img');
      jie['thumb-update'](document.querySelector('.save-preview'), win);
    }
  },
  'top-bar-file-menu.Close': function() {
    var win = document.querySelector('.window.image.selected');
    if (win) {
      jie['top-bar-menu-clear']();
      jie['window-close'](win);
    }
  },
  'top-bar-image-menu.Flip Vertical': function() {
    jie['top-bar-menu-clear']();
    var win = document.querySelector('.window.image.selected');
    if (win) {
      jie['image-flip'](win, false, true);
      jie['history-add-action']('Flip Vertical', win);
    }
  },
  'top-bar-image-menu.Flip Horizontal': function() {
    jie['top-bar-menu-clear']();
    var win = document.querySelector('.window.image.selected');
    if (win) {
      jie['image-flip'](win, true, false);
      jie['history-add-action']('Flip Horizontal', win);
    }
  },
  'top-bar-layer-menu.Flip Vertical': function() {
    jie['top-bar-menu-clear']();
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var layer = document.querySelector('.current.layer-list .selected.layer');
      jie['layer-flip'](layer, false, true);
      var img = jie['layer-get-img'](layer);
      jie['history-add-action']('Layer Flip Vertical', win);
    }
  },
  'top-bar-layer-menu.Flip Horizontal': function() {
    jie['top-bar-menu-clear']();
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var layer = document.querySelector('.current.layer-list .selected.layer');
      jie['layer-flip'](layer, true, false);
      var img = jie['layer-get-img'](layer);
      jie['history-add-action']('Layer Flip Horizontal', win);
    }
  },
  'url-error': function() {
    alert('Sorry, we were not able to get an image from this URL');
  },
  'url-load': function(event) {
    event.target.removeEventListener(event.type, arguments.callee);
    var img = this;
    var image = {
      name: img.name,
      width: img.width,
      height: img.height
    };
    var win = jie['window-image-create'](image, img);
  },
  'window-bars-close': function(event) {
    var win = jie['query-up'](event.target, '.window');
    jie['window-close'](win);
  },
  'window-clear-content': function(win) {
    var container = win.querySelector('.window.selected .zoom-img');
    if (container)
      container.innerHTML = '';
  },
  'window-clear-selection': function() {
    var selected = document.querySelector('.window.selected');
    if (selected)
      selected.classList.remove('selected');
  },
  'window-close': function(win) {
    if (win) {
      if (win.classList.contains('image')) {
        // if (jie['Prompt Save']) jie['Save Image'](); else
        document.querySelector('.layer-list[data-id=' + win.id + ']').remove();
        document.querySelector('.history-list[data-id=' + win.id + ']').remove();
        win.remove();
        var nextWin = document.querySelector('.window.image');
        if (nextWin)
          jie['window-select'].call(nextWin);
        else {
          jie['nav-update']();
        }
      } else {
        jie['window-hide-pops']();
        win.classList.add('hidden');
      }
    }
  },
  'window-create': function(name) {
    var win = document.createElement('div');
    jie['window-clear-selection']();
    win.className = 'window';
    win.addEventListener('mousedown', jie['window-select']);
    win.style.top = jie['window-create-offset'].x + 'px';
    win.style.left = jie['window-create-offset'].y + 'px';
    jie['window-create-offset'].x += 25;
    jie['window-create-offset'].y += 20;
    var bar = document.createElement('h1');
    bar.className = 'window-bar';
    bar.addEventListener('mousedown', jie['mouse-down-drag-start']);
    win.appendChild(bar);
    var title = document.createElement('span');
    title.className = 'name';
    title.textContent = name;
    bar.appendChild(title);
    var close = document.createElement('span');
    close.className = 'close-window fa fa-window-close';
    close.addEventListener('click', jie['window-bars-close']);
    bar.appendChild(close);
    var container = document.createElement('div');
    container.className = 'window-container';
    win.appendChild(container);
    var resizer = document.createElement('div');
    resizer.className = 'window-resizer fa fa-caret-right';
    resizer.addEventListener('mousedown', jie['mouse-resize-start']);
    win.appendChild(resizer);
    document.querySelector('.windows-container').appendChild(win);
    return win;
  },
  'window-create-offset': {
    x: 100,
    y: 100
  },
  'window-show-pop': function(selector) {
    var item;
    jie['window-hide-pops']();
    document.querySelector('.overlay').classList.remove('hidden');
    document.querySelector(selector).classList.remove('hidden');
  },
  'window-hide-pops': function(selector) {
    var item;
    var pops = document.querySelectorAll('.pop');
    for (item of pops)
      item.classList.add('hidden');
    document.querySelector('.overlay').classList.add('hidden');
  },
  'window-add-img': function(win, img) {
    img.draggable = false;
    var opacity = 100;
    if (img.dataset.opacity)
      opacity = img.dataset.opacity;
    else
      img.dataset.opacity = opacity;
    jie['layer-opacity-update'](opacity);
    img.style.opacity = opacity / 100;
    var scale = document.querySelector('.zoom-input').value / 100;
    img.style.transform = 'scale(' + scale + ')';
    img.addEventListener('mousedown', jie['mouse-down-image']);
    img.addEventListener('mousemove', jie['mouse-move-image']);
    win.querySelector('.zoom-img').appendChild(img);
  },
  'window-image-create': function(image, img) {
    var win = jie['window-create'](image.name);
    win.style.width = (image.width + 20) + 'px';
    win.style.height = (image.height + 38) + 'px';
    win.classList.add('image', 'selected');
    win.id = jie['image-id-new']();
    var trans = document.createElement('div');
    trans.className = 'transparent-pattern';
    trans.style.width = image.width + 'px';
    trans.style.height = image.height + 'px';
    trans.addEventListener('wheel', jie['prevent-event']);
    var container = win.querySelector('.window-container');
    container.addEventListener('wheel', jie['zoom-scroll']);
    var zoom = document.createElement('div');
    zoom.className = 'zoom-img';
    container.appendChild(trans);
    trans.appendChild(zoom);
    jie['window-add-img'](win, img);
    var cb = function() {
      jie['history-create-list'](img, win);
      jie['layer-create-list'](img, win);
      jie['nav-update'](win);
    };
    if (!img.jimpImage)
      jie['jimpImage-create'](img, cb);
    else
      cb();
    return win;
  },
  'window-select': function(event) {
    var win = this;
    if (!win.classList.contains('selected')) {
      jie['window-clear-selection']();
      win.classList.add('selected');
      document.querySelector('.windows-container').appendChild(win);
      jie['layer-list-update'](win);
      jie['history-list-update'](win);
      jie['nav-update'](win);
    }
  },
  'window-start': function() {
    var item;
    var windowBars = document.querySelectorAll('.window .window-bar');
    for (item of windowBars)
      item.addEventListener('mousedown', jie['mouse-down-drag-start']);
    var cancelLinks = document.querySelectorAll('.window.pop .cancel');
    for (item of cancelLinks)
      item.addEventListener('click', jie['window-hide-pops']);
    var closeWindowBars = document.querySelectorAll('.window-bar .close-window');
    for (item of closeWindowBars)
      item.addEventListener('click', jie['window-bars-close']);
  },
  'zoom-change': function() {
    var zoom = Math.round(this.value);
    document.querySelector('.zoom-input').value = zoom;
    jie['zoom-set'](zoom);
  },
  'zoom-current': {
    x: 0.5,
    y: 0.5
  },
  'zoom-get': function(zoom) {
    return Math.round(document.querySelector('.zoom-input').value);
  },
  'zoom-reset': function() {
    var zoom = 100;
    document.querySelector('.zoom-range').value = zoom;
    document.querySelector('.zoom-input').value = zoom;
    jie['zoom-current'] = {
      x: 0.5,
      y: 0.5
    };
  },
  'zoom-scroll': function(event) {
    var zoom = jie['zoom-get']();
    var f = 10
      , w = -1;
    if (event.deltaY > 0) {
      w = 1;
    }
    f *= w;
    zoom = Math.round(zoom + f);
    jie['zoom-set'](zoom);
    event.preventDefault();
  },
  'zoom-set': function(zoom) {
    zoom = Math.max(zoom, 10);
    zoom = Math.min(zoom, 990);
    document.querySelector('.zoom-range').value = zoom;
    document.querySelector('.zoom-input').value = zoom;
    var x = document.querySelector('.nav-box .info-x').textContent - 1;
    var y = document.querySelector('.nav-box .info-y').textContent - 1;
    var win = document.querySelector('.window.image.selected');
    if (win) {
      var imgs = win.querySelectorAll('img');
      var img = imgs[0];
      if (x)
        jie['zoom-current'].x = x / img.width;
      if (y)
        jie['zoom-current'].y = y / img.height;
      var container = document.querySelector('.window.image.selected .window-container');
      var offset = {
        x: jie['zoom-current'].x * (container.scrollWidth - container.offsetWidth + 18),
        y: jie['zoom-current'].y * (container.scrollHeight - container.offsetHeight + 12)
      };
      container.scrollLeft = Math.floor(offset.x);
      container.scrollTop = Math.floor(offset.y);
      var scale = zoom / 100;
      var size = {
        width: img.width * scale,
        height: img.height * scale
      };
      jie['set-size'](img.parentElement, size);
      jie['set-size'](img.parentElement.parentElement, size);
      for (img of imgs) {
        img.style.transform = 'scale(' + scale + ')';
        img.dataset.scale = scale;
      }
    }
  }
};

window.addEventListener('load', jie.start);
