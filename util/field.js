/*
 * field parsing and creating utilities
 */

import {string} from 'can-util';
import {makeSentenceCase} from './string';
import stache from 'can-stache';
import DefineMap from 'can-define/map/map';


const TEMPLATES = {
    text: '<text-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />',
    select: '<select-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />',
    file: '<file-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />',
    json: '<json-field {properties}="properties" (change)="setField" {value}="getFieldValue(.)" />',
    date: '<date-field {properties}="properties" (change)="setField" value="{{getFieldValue(.)}}" />'
};

//precompile templates
for (var type in TEMPLATES) {
    if (TEMPLATES.hasOwnProperty(type)) {
        TEMPLATES[type] = stache(TEMPLATES[type]);
    }
}

export {TEMPLATES};

/**
 * @module util/field.Field FieldDefinition
 * @parent crud.types
 *
 */
export const Field = DefineMap.extend('Field', {
  /**
   * The name of the property on the object, this field's name
   * @property {String} util/field.Field.name
   */
    name: {
        type: 'string'
    },
  /**
   * A friendly name for the field used to display to the user
   * The default is to capitalize the name and remove underscores
   * @property {String} util/field.Field.alias
   */
    alias: {
        type: 'string',
        get (alias) {
            if (alias) {
                return alias;
            }
            return makeSentenceCase(this.name);
        }
    },
  /**
   * The type of the form field to use when editing this field. These types
   * are defined in the `util/field.TEMPLATES` constant
   * @property {String} util/field.Field.type
   */
    fieldType: {
        type: 'string',
        value: 'text'
    },
  /**
   * The form field template to use when editing this field. This should be
   * a stache template renderer. By default, this value is set to the
   * template for the given `type` property.
   * @property {Renderer}
   */
    formTemplate: {
        get (template) {
            if (template) {
                return template;
            }
            const type = this.fieldType;
            if (!TEMPLATES.hasOwnProperty(type)) {
                console.warn('No template for the given field type', type);
                return TEMPLATES.text;
            }
            return TEMPLATES[type];
        }
    },
  /**
   * Excludes this field from the list-table
   * @property {Boolean}
   */
    excludeListTable: {
        value: false
    },
  /**
   * Excludes this field from the property-table
   * @property {Boolean}
   */
    excludePropertyTable: {
        value: false
    },
  /**
   * Excludes this field from the form-widget
   * @property {Boolean}
   */
    excludeForm: {
        value: false
    },
  /**
   * Formats the property when it is displayed in a property or list table
   * @property {Function}
   */
    formatter: {
        value: null
    },
    getFormattedValue (obj) {
        return this.formatter ?
      this.formatter(obj[this.name], obj) : obj[this.name];
    }
});


/**
 * @function util/field.parseFieldArray
 * Converts an array of strings or field json objects into Field objects
 * @param  {Array<Field | String>} fields An array of either strings or JSON like objects representing Field object properties
 * @return {Array<Field>} The array of fields
 */
export function parseFieldArray (fields) {
    return fields.map((f) => {
        if (typeof f === 'string') {
            f = {
                name: f
            };
        }
        return new Field(f);
    });
}

/**
 * @function util/field.mapToFields
 * Converts a DefineMap to an array of Field objects using the define
 * property or the keys
 * @param  {Constructor<DefineMap>} m The extended map/constructor to parse
 * @return {Array<Field>} The array of fields
 */
export function mapToFields (m) {
    if (!m) {
        console.warn('map is undefined, so no fields will be generated');
        return [];
    }
    const fields = [];
    m.forEach((value, propName) => {
        fields.push(Object.assign({
            name: propName,
            type: 'string',
            fieldType: 'text'
        }, m[propName]));
    });
    return parseFieldArray(fields);
}
