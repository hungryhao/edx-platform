;(function (define, undefined) {
'use strict';
define(['jquery', 'underscore', 'annotator'], function ($, _, Annotator) {
    /**
     * Adds the Accessibility Plugin
     **/
    Annotator.Plugin.Accessibility = function () {
        // Call the Annotator.Plugin constructor this sets up the element and
        // options properties.
        Annotator.Plugin.apply(this, arguments);
    };

    $.extend(Annotator.Plugin.Accessibility.prototype, new Annotator.Plugin(), {
        pluginInit: function () {
            this.annotator.subscribe('annotationViewerTextField', _.bind(this.addAriaAttributes, this));
            this.annotator.element.on('keydown', '.annotator-hl', _.bind(this.onHighlightKeyDown, this));
            this.annotator.element.on('keydown', '.annotator-viewer', _.bind(this.onViewerKeyDown, this));
            this.annotator.element.on('keydown', '.annotator-editor', _.bind(this.onEditorKeyDown, this));
            this.addTabIndex();
        },

        destroy: function () {
            this.annotator.unsubscribe('annotationViewerTextField', this.addAriaAttributes);
            this.annotator.element.off('keydown', '.annotator-hl');
            this.annotator.element.off('keydown', '.annotator-viewer');
            this.annotator.element.off('keydown', '.annotator-editor');
        },

        addTabIndex: function () {
            var controls, edit, del;
            controls = this.annotator.element.find('.annotator-controls');
            edit = controls.find('.annotator-edit');
            edit.attr('tabindex', 0);
            del = controls.find('.annotator-delete');
            del.attr('tabindex', 0);
        },

        addAriaAttributes: function (field, annotation) {
            var ariaNoteId = 'aria-note-' + annotation.id;
            // Add ARIA attributes to highlighted text ie <span class="annotator-hl">Highlighted text</span>
            // tabindex is set to 0 to make the span focusable via the TAB key.
            // aria-describedby refers to the actual note that was taken.
            _.each(annotation.highlights, function(highlight) {
                $(highlight).attr('aria-describedby', ariaNoteId);
            });
            // Add ARIA attributes to associated note ie <div>My note</div>
            $(field).attr({
                'id': ariaNoteId,
                'role': 'note',
                'aria-label': 'Note'
            });
        },

        onHighlightKeyDown: function (event) {
            var KEY = $.ui.keyCode,
                keyCode = event.keyCode,
                target = $(event.currentTarget),
                annotations, position,
                controls, edit;

            switch (keyCode) {
                case KEY.TAB:
                    if (this.annotator.viewer.isShown()) {
                        controls = this.annotator.element.find('.annotator-controls');
                        edit = controls.find('.annotator-edit');
                        edit.focus();
                    }
                    break;
                case KEY.ENTER:
                case KEY.SPACE:
                    if (!this.annotator.viewer.isShown()) {
                        position = target.position();
                        annotations = target.parents('.annotator-hl').addBack().map(function() {
                            return $(this).data('annotation');
                        });
                        this.annotator.showViewer($.makeArray(annotations), {top: position.top, left: position.left});
                    }
                    break;
                case KEY.ESCAPE:
                    this.annotator.viewer.hide();
                    break;
            }
            // We do not stop propagation and default behavior on a TAB keypress
            if (event.keyCode !== KEY.TAB || (event.keyCode == KEY.TAB && this.annotator.viewer.isShown())) {
                event.preventDefault();
                event.stopPropagation();
            }
        },

        onViewerKeyDown: function (event) {
            var KEY = $.ui.keyCode,
                keyCode = event.keyCode,
                target = $(event.target),
                viewer, viewerControls, edit, del,
                note, id;

            // Viewer elements
            viewer = this.annotator.element.find('.annotator-viewer');
            viewerControls = viewer.find('.annotator-controls');
            edit = viewerControls.find('.annotator-edit');
            del = viewerControls.find('.annotator-delete');

            switch (keyCode) {
                case KEY.TAB:
                    if (target.is(edit)) {
                        del.focus();
                    } else if (target.is(del)) {
                        edit.focus();
                    }
                    event.preventDefault();
                    event.stopPropagation();
                    break;
                case KEY.ESCAPE:
                    this.annotator.viewer.hide();
                    note = viewerControls.siblings('div[role="note"]');
                    id = note.attr('id');
                    $('.annotator-hl[aria-describedby=' + id + ']').focus();
                    break;
            }
        },

        onEditorKeyDown: function (event) {
            var KEY = $.ui.keyCode,
                keyCode = event.keyCode,
                target = $(event.target),
                editor, editorControls, listing, items, firstItem, save, cancel,
                viewer, viewerControls,
                note, id;

            // Viewer elements
            viewer = this.annotator.element.find('.annotator-viewer');
            viewerControls = viewer.find('.annotator-controls');

            // Editor elements
            editor = this.annotator.element.find('.annotator-editor');
            listing = editor.find('.annotator-listing');
            editorControls = editor.find('.annotator-controls');
            items = listing.find('.annotator-item');
            firstItem = items.first();
            save  = editorControls.find('.annotator-save');
            cancel = editorControls.find('.annotator-cancel');

            switch (keyCode) {
                case KEY.TAB:
                    if (target.is(firstItem.children('textarea')) && event.shiftKey) {
                        cancel.focus();
                        event.preventDefault();
                        event.stopPropagation();
                    } else if (target.is(cancel) && !event.shiftKey) {
                        firstItem.children('textarea').focus();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                    break;
                case KEY.ENTER:
                case KEY.SPACE:
                    if (target.is(save)) {
                        this.annotator.editor.submit();
                    } else if (target.is(cancel)) {
                        this.annotator.editor.hide();
                    }
                    note = viewerControls.siblings('div[role="note"]');
                    id = note.attr('id');
                    $('.annotator-hl[aria-describedby=' + id + ']').focus();
                    event.preventDefault();
                    break;
                case KEY.ESCAPE:
                    this.annotator.editor.hide();
                    note = viewerControls.siblings('div[role="note"]');
                    id = note.attr('id');
                    $('.annotator-hl[aria-describedby=' + id + ']').focus();
                    event.preventDefault();
                    break;
            }
        }
    });
});
}).call(this, define || RequireJS.define);
