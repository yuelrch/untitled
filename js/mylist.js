/**
 * Created by hi on 2016/6/13.
 */
(function( $, window, undefined ) {
    $.widget( "mobile.listview", $.mobile.listview, {
        options: {
            childPages: true,
            page: "<div data-role='page'></div>",
            header: "<div data-role='header'><a href='#' data-rel='back'>Back</a><h1></h1></div>",
            content: "<div class='ui-content'></div>"
        },
        _create: function(){
            this._super();
            if( this.options.childPages ) {
                this._setupChildren();
            }
        },
        _setupChildren: function() {
            this._attachBindings();
            this.element.find( "ul" )
                .css( "display","none" )
                .parent()
                .addClass("ui-btn ui-btn-icon-right ui-icon-carat-r");
        },
        _attachBindings: function() {
            this._on({
                "click": "_handleSubpageClick"
            });
            this._on( "body", {
                "pagechange": function(){
                    if ( this.opening === true ) {
                        this.open = true;
                        this.opening = false;
                    } else if ( this.open === true ) {
                        this.newPage.remove();
                        this.open = false;
                    }
                }
            });
        },
        _handleSubpageClick: function( event ) {
            if( $(event.target).closest( "li" ).children( "ul" ).length == 0 ) {
                return;
            }
            this.opening = true;
            this.newPage = $( this.options.page ).uniqueId();
            this.nestedList  = $( event.target ).children( "ul" )
                .clone().attr( "data-" + $.mobile.ns + "role", "listview" )
                .css( "display", "block" );
            this.pageName = (
            $( event.target.childNodes[0] ).text().replace(/^\s+|\s+$/g, '').length > 0 )?
                $( event.target.childNodes[0] ).text() : $( event.target.childNodes[1] ).text();
            this.pageID = this.newPage.attr( "id" );
            // Build new page
            this.newPage.append(
                $( this.options.header ).find( "h1" ).text( this.pageName ).end()
            ).append(
                $( this.options.content )
            ).find( "div.ui-content" ).append( this.nestedList );
            $( "body" ).append( this.newPage );
            $( "body" ).pagecontainer( "change", "#" + this.pageID );
        }
    });
})( jQuery, this );


$( document ).on( "pagecreate", "#demo-page", function() {
    // Swipe to remove list item
    $( document ).on( "swipeleft swiperight", "#list li", function( event ) {
        var listitem = $( this ),
        // These are the classnames used for the CSS transition
            dir = event.type === "swipeleft" ? "left" : "right",
        // Check if the browser supports the transform (3D) CSS transition
            transition = $.support.cssTransform3d ? dir : false;
        confirmAndDelete( listitem, transition );
    });
    // If it's not a touch device...
    if ( ! $.mobile.support.touch ) {
        // Remove the class that is used to hide the delete button on touch devices
        $( "#list" ).removeClass( "touch" );
        // Click delete split-button to remove list item
        $( ".delete" ).on( "click", function() {
            var listitem = $( this ).parent( "li" );
            confirmAndDelete( listitem );
        });
    }
    function confirmAndDelete( listitem, transition ) {
        // Highlight the list item that will be removed
        listitem.children( ".ui-btn" ).addClass( "ui-btn-active" );
        // Inject topic in confirmation popup after removing any previous injected topics
        $( "#confirm .topic" ).remove();
        listitem.find( ".topic" ).clone().insertAfter( "#question" );
        // Show the confirmation popup
        $( "#confirm" ).popup( "open" );
        // Proceed when the user confirms
        $( "#confirm #yes" ).on( "click", function() {
            // Remove with a transition
            if ( transition ) {
                listitem
                // Add the class for the transition direction
                    .addClass( transition )
                    //When the transition is done...
                    .on( "webkitTransitionEnd transitionend otransitionend", function() {
                        // ...the list item will be removed
                        listitem.remove();
                        // ...the list will be refreshed and the temporary class for border styling removed
                        $( "#list" ).listview( "refresh" ).find( ".border-bottom" ).removeClass( "border-bottom" );
                    })
                    // During the transition the previous button gets bottom border
                    .prev( "li" ).children( "a" ).addClass( "border-bottom" )
                // Remove the highlight
                    .end().end().children( ".ui-btn" ).removeClass( "ui-btn-active" );
            }
            // If it's not a touch device or the CSS transition isn't supported just remove the list item and refresh the list
            else {
                listitem.remove();
                $( "#list" ).listview( "refresh" );
            }
        });
        // Remove active state and unbind when the cancel button is clicked
        $( "#confirm #cancel" ).on( "click", function() {
            listitem.children( ".ui-btn" ).removeClass( "ui-btn-active" );
                    $( "#confirm #yes" ).off();
        });
    }
});