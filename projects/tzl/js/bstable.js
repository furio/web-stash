/*
 * BSTable
 * @description  Javascript (JQuery) library to make bootstrap tables editable. Inspired by Tito Hinostroza's library Bootstable. BSTable Copyright (C) 2020 Thomas Rokicki
 * 
 * @version 1.0
 * @author Thomas Rokicki (CraftingGamerTom), Tito Hinostroza (t-edson)
 */

"use strict";

class Base64 {

    // private property
    constructor() {
        this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    }

    // public method for encoding
    encode(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = this._utf8_encode(input);

        while (i < input.length)
        {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2))
            {
                enc3 = enc4 = 64;
            }
            else if (isNaN(chr3))
            {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        } // Whend 

        return output;
    } // End Function encode 


    // public method for decoding
    decode(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length)
        {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64)
            {
                output = output + String.fromCharCode(chr2);
            }

            if (enc4 != 64)
            {
                output = output + String.fromCharCode(chr3);
            }

        } // Whend 

        output = this._utf8_decode(output);

        return output;
    } // End Function decode 


    // private method for UTF-8 encoding
    _utf8_encode(string) {
        var utftext = "";
        string = string.replace(/\r\n/g, "\n");

        for (var n = 0; n < string.length; n++)
        {
            var c = string.charCodeAt(n);

            if (c < 128)
            {
                utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048))
            {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else
            {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        } // Next n 

        return utftext;
    } // End Function _utf8_encode 

    // private method for UTF-8 decoding
    _utf8_decode(utftext) {
        var string = "";
        var i = 0;
        var c, c1, c2, c3;
        c = c1 = c2 = 0;

        while (i < utftext.length)
        {
            c = utftext.charCodeAt(i);

            if (c < 128)
            {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224))
            {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else
            {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        } // Whend 

        return string;
    } // End Function _utf8_decode
}

/** @class BSTable class that represents an editable bootstrap table. */
class BSTable {
    
  /**
   * Creates an instance of BSTable.
   *
   * @constructor
   * @author: Thomas Rokicki (CraftingGamerTom)
   * @param {tableId} tableId The id of the table to make editable.
   * @param {options} options The desired options for the editable table.
   */
  constructor(tableId, options) {

    const defaults = {
      editableColumns: null,          // Index to editable columns. If null all td will be editable. Ex.: "1,2,3,4,5"
      $addButton: null,               // Jquery object of "Add" button
      onTransformEdit: function(text, td) { return text; },
      onEdit: function() {},          // Called after edition
      onBeforeDelete: function() {},  // Called before deletion
      onDelete: function() {},        // Called after deletion
      onAdd: function() {},           // Called when added a new row
      advanced: {                     // Do not override advanced unless you know what youre doing
          columnLabel: 'Actions',
          buttonHTML: `<div class="btn-group pull-right">
                <button id="bEdit" type="button" class="btn btn-sm btn-default">
                    <span class="fa fa-edit" > </span>
                </button>
                <button id="bDel" type="button" class="btn btn-sm btn-default">
                    <span class="fa fa-trash" > </span>
                </button>
                <button id="bAcep" type="button" class="btn btn-sm btn-default" style="display:none;">
                    <span class="fa fa-check-circle" > </span>
                </button>
                <button id="bCanc" type="button" class="btn btn-sm btn-default" style="display:none;">
                    <span class="fa fa-times-circle" > </span>
                </button>
            </div>`
      }
    };

    this.table = $('#' + tableId);
    this.options = $.extend(true, defaults, options);
    this.base64 = new Base64();

    /** @private */ this.actionsColumnHTML = '<td name="bstable-actions">' + this.options.advanced.buttonHTML + '</td>'; 
  }

  // --------------------------------------------------
  // -- Public Functions
  // --------------------------------------------------

  /**
   * Initializes the editable table. Creates the actions column.
   * @since 1.0.0
   */
  init() {
    this.table.find('thead tr').append('<th name="bstable-actions">' + this.options.advanced.columnLabel + '</th>');  // Append column to header
    this.table.find('tbody tr').append(this.actionsColumnHTML);

    this._addOnClickEventsToActions(); // Add onclick events to each action button in all rows

    // Process "addButton" parameter
    if (this.options.$addButton != null) {
      let _this = this;
      // Add a managed onclick event to the button
      this.options.$addButton.click(function() {
        _this._actionAddRow();
      });
    }
    //Process "editableColumns" parameter. Sets the columns that will be editable
    if (this.options.editableColumns != null) {
      //Extract felds
      this.options.editableColumns = this.options.editableColumns.split(',');
    }
  }

  /**
   * Destroys the editable table. Removes the actions column.
   * @since 1.0.0
   */
  destroy() {
    this.table.find('th[name="bstable-actions"]').remove(); //remove header
    this.table.find('td[name="bstable-actions"]').remove(); //remove body rows
  }

  /**
   * Refreshes the editable table. 
   *
   * Literally just removes and initializes the editable table again, wrapped in one function.
   * @since 1.0.0
   */
  refresh() {
    this.destroy();
    this.init();
  }

  // --------------------------------------------------
  // -- 'Static' Functions
  // --------------------------------------------------

  /**
   * Returns whether the provided row is currently being edited.
   *
   * @param {Object} row
   * @return {boolean} true if row is currently being edited.
   * @since 1.0.0
   */
  currentlyEditingRow($row) {
    // Check if the row is currently being edited
    if ($row.attr('data-status')=='editing') {
        return true;
    } else {
        return false;
    }
  }

  // --------------------------------------------------
  // -- Button Mode Functions
  // --------------------------------------------------

  _actionsModeNormal(button) {
    $(button).parent().find('#bAcep').hide();
    $(button).parent().find('#bCanc').hide();
    $(button).parent().find('#bEdit').show();
    $(button).parent().find('#bDel').show();
    let $row = $(button).parents('tr');         // get the row
    $row.attr('data-status', '');               // remove editing status
  }
  _actionsModeEdit(button) {
    $(button).parent().find('#bAcep').show();
    $(button).parent().find('#bCanc').show();
    $(button).parent().find('#bEdit').hide();
    $(button).parent().find('#bDel').hide();
    let $row = $(button).parents('tr');         // get the row
    $row.attr('data-status', 'editing');        // indicate the editing status
  }

  // --------------------------------------------------
  // -- Private Event Functions
  // --------------------------------------------------

  _rowEdit(button) {                  
  // Indicate user is editing the row
    let _this = this;
    let $row = $(button).parents('tr');       // access the row
    let $cols = $row.find('td');              // read rows
    if (this.currentlyEditingRow($row)) return;    // not currently editing, return
    //Pone en modo de edición
    this._modifyEachColumn(this.options.editableColumns, $cols, function($td) {  // modify each column
      let content = $td.html();             // read content
      let div = '<div style="display: none;">' + _this.base64.encode(content) + '</div>';  // hide content (save for later use)
      let input = '<input class="form-control input-sm" />' ; // data-original-value="' + content + '" value="' + content + '">';
      $td.html(div + input);                // set content
      input = $td.find('input');
      input.val(content);
      input.attr("data-original-value", content);
    });
    this._actionsModeEdit(button);
  }
  _rowDelete(button) {                        
  // Remove the row
    let $row = $(button).parents('tr');       // access the row
    this.options.onBeforeDelete($row);
    $row.remove();
    this.options.onDelete();
  }
  _rowAccept(button) {
  // Accept the changes to the row
    let $row = $(button).parents('tr');       // access the row
    let $cols = $row.find('td');              // read fields
    if (!this.currentlyEditingRow($row)) return;   // not currently editing, return
    
    // Finish editing the row & save edits
    let transformEditFn = this.options.onTransformEdit;
    this._modifyEachColumn(this.options.editableColumns, $cols, function($td) {  // modify each column
      let cont = $td.find('input').val();     // read through each input
      $td.html(transformEditFn(cont,$td));                         // set the content and remove the input fields
    });
    this._actionsModeNormal(button);
    this.options.onEdit($row);
  }
  _rowCancel(button) {
  // Reject the changes
    let _this = this;
    let $row = $(button).parents('tr');       // access the row
    let $cols = $row.find('td');              // read fields
    if (!this.currentlyEditingRow($row)) return;   // not currently editing, return

    // Finish editing the row & delete changes
    this._modifyEachColumn(this.options.editableColumns, $cols, function($td) {  // modify each column
        let cont = _this.base64.decode($td.find('div').html());    // read div content
        $td.html(cont);                       // set the content and remove the input fields
    });
    this._actionsModeNormal(button);
  }
  _actionAddRow() {
    // Add row to this table
    let $allRows = this.table.find('tbody tr');
    if ($allRows.length==0) { // there are no rows. we must create them
      let $row = this.table.find('thead tr');  // find header
      let $cols = $row.find('th');  // read each header field
      // create the new row
      let newColumnHTML = '';
      $cols.each(function() {
        let column = this; // Inner function this (column object)
        if ($(column).attr('name')=='bstable-actions') {
          newColumnHTML = newColumnHTML + actionsColumnHTML;  // add action buttons
        } else {
          newColumnHTML = newColumnHTML + '<td></td>';
        }
      });
      this.table.find('tbody').append('<tr>'+newColumnHTML+'</tr>');
    } else { // there are rows in the table. We will clone the last row
      let $lastRow = this.table.find('tr:last');
      $lastRow.clone().appendTo($lastRow.parent());  
      $lastRow = this.table.find('tr:last');
      let $cols = $lastRow.find('td');  //lee campos
      $cols.each(function() {
        let column = this; // Inner function this (column object)
        if ($(column).attr('name')=='bstable-actions') {
          // action buttons column. change nothing
        } else {
          $(column).html('');  // clear the text
        }
      });
    }
    this._addOnClickEventsToActions(); // Add onclick events to each action button in all rows
    this.options.onAdd();
  }

  // --------------------------------------------------
  // -- Helper Functions
  // --------------------------------------------------

  _modifyEachColumn($editableColumns, $cols, howToModify) {
  // Go through each editable field and perform the howToModifyFunction function
    let n = 0;
    $cols.each(function() {
      n++;
      if ($(this).attr('name')=='bstable-actions') return;    // exclude the actions column
      if (!isEditableColumn(n-1)) return;                     // Check if the column is editable
      howToModify($(this));                                   // If editable, call the provided function
    });
    // console.log("Number of modified columns: " + n); // debug log
    

    function isEditableColumn(columnIndex) {
    // Indicates if the column is editable, based on configuration
        if ($editableColumns==null) {                           // option not defined
            return true;                                        // all columns are editable
        } else {                                                // option is defined
            //console.log('isEditableColumn: ' + columnIndex);  // DEBUG
            for (var i = 0; i < $editableColumns.length; i++) {
              if (columnIndex == $editableColumns[i]) return true;
            }
            return false;  // column not found
        }
    }
  }

  _addOnClickEventsToActions() {
    let _this = this;
    // Add onclick events to each action button
    this.table.find('tbody tr #bEdit').each(function() {let button = this; button.onclick = function() {_this._rowEdit(button)} });
    this.table.find('tbody tr #bDel').each(function() {let button = this; button.onclick = function() {_this._rowDelete(button)} });
    this.table.find('tbody tr #bAcep').each(function() {let button = this; button.onclick = function() {_this._rowAccept(button)} });
    this.table.find('tbody tr #bCanc').each(function() {let button = this; button.onclick = function() {_this._rowCancel(button)} });
  }

  // --------------------------------------------------
  // -- Conversion Functions
  // --------------------------------------------------

  convertTableToCSV(separator) {  
  // Convert table to CSV
    let _this = this;
    let rowValues = '';
    let tableValues = '';

    _this.table.find('tbody tr').each(function() {
        // force edits to complete if in progress
        if (_this.currentlyEditingRow($(this))) {
            $(this).find('#bAcep').click();       // Force Accept Edit
        }
        let $cols = $(this).find('td');           // read columns
        rowValues = '';
        $cols.each(function() {
            if ($(this).attr('name')=='bstable-actions') {
                // buttons column - do nothing
            } else {
                rowValues = rowValues + $(this).html() + separator;
            }
        });
        if (rowValues!='') {
            rowValues = rowValues.substr(0, rowValues.length-separator.length); 
        }
        tableValues = tableValues + rowValues + '\n';
    });
    return tableValues;
  }
}
