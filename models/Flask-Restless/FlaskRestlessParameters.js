import CanMap from 'can/map/';
import List from 'can/list/';
import 'can/map/define/';

export const FilterSerializers = {
  not_like: {
    operator: 'not_like'
  },
  like: {
    operator: 'like',
    serialize(val) {
      return ['%', val, '%'].join('');
    }
  },
  starts_with: {
    operator: 'like',
    serialize(val) {
      return [val, '%'].join('');
    }
  },
  ends_with: {
    operator: 'like',
    serialize(val) {
      return ['%', val].join('');
    }
  },
  equals: {
    operator: 'equals'
  },
  not_equal_to: {
    operator: 'not_equal_to',
  },
  greater_than: {
    operator: '>',
    serialize(val) {
      return parseFloat(val);
    }
  },
  less_than: {
    operator: '<',
    serialize(val) {
      return parseFloat(val);
    }
  },
  before: {
    operator: '<'
  },
  after: {
    operator: '>'
  }
};

export const FilterMap = CanMap.extend({
  define: {
    value: {
      serialize: false,
      set(val) {
        this.attr('val', val);
        return val;
      }
    },
    val: {
      serialize(val){
        if(val && this.attr('operator')){
          let op = FilterSerializers[this.attr('operator')];
          if(op && op.serialize){
            return op.serialize(val);
          }
        }
        return val;
      }
    },
    name: {
      type: 'string',
      value: ''
    },
    op: {
      value: 'like',
      type: 'string'
    },
    operator: {
    serialize: false,
      value: 'like',
      set(val) {
        let op = FilterSerializers[val];
        if(op){
          val = op.operator;
        }
        this.attr('op', val);
        return val;
      }
    }
  }
});

export const FilterList = List.extend({
  'Map': FilterMap
}, {});

/**
 * @module {can.Map} ParameterMap
 * @description A set of parameters that serializes to valid json api parameters
 * that allow querying, filtering, and sorting on the flask-restless api resource
 */
export const ParameterMap = CanMap.extend({
  define: {
    /**
     * @property {can.Map} ParameterMap.props.sort A sort parameter.
     * @parent ParameterMap.props
     */
    sort: {
      Type: CanMap,
      serialize(sort) {
        if (!sort) {
          return;
        }
        let field = sort.attr('fieldName');
        if (!field) {
          return;
        }
        return sort.attr('type') === 'asc' ? field : '-' + field;
      }
    },
    filters: {
      Type: FilterList,
      Value: FilterList,
      serialize: false,
      set(filters) {
        if (filters && filters.length) {
          //if there are filters in the list, set the filter parameter
          this.attr('filter[objects]', JSON.stringify(filters.serialize()));
        } else {
          //remove the filter parameter
          this.removeAttr('filter[objects]');
        }
        return filters;
      }
    },
    page: {
      type: 'number',
      value: 0,
      serialize: false,
      set(page) {
        this.attr('page[number]', page + 1);
        return page;
      }
    },
    perPage: {
      type: 'number',
      value: 10,
      serialize: false,
      set(items) {
        this.attr('page[size]', items);
        return items;
      }
    }
  }
});

export default ParameterMap;
