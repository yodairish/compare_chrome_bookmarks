jest.dontMock('../js/modules/compare');

var Compare = require("../js/modules/compare"),
    compare = new Compare();

describe('Compare', function() {
  var bookmarks1 = {
        'some': {
          data: {
            added: '112233',
            modify: '332211',
            personal: true
          },
          links: [{
            added: '11',
            icon: 'img',
            title: 'text',
            url: 'link'
          },{
            added: '22',
            icon: 'img2',
            title: 'text2',
            url: 'link2'
          }],
          'other': {
            data: {},
            links: []
          },
          'andOther': {
            data: {
              added: '555',
              modify: '666'
            },
            links: [{
              added: '11',
              icon: 'img20'
            }]
          }
        }
      },
      bookmarks2 = {
        'some': {
          data: {
            added: '44',
            modify: '55'
          },
          links: [{
            added: '111',
            icon: 'img1',
            title: 'text1',
            url: 'link'
          },{
            added: '22',
            icon: 'img2',
            title: 'text2',
            url: 'link3'
          }],
          'other': {
            data: {
              added: '77'
            },
            links: []
          },
          'second': {
            data: {},
            links: [{
              added: '777',
              icon: 'img10'
            }]
          }
        }
      };
  
  it('If we send nothing or empty arrat, return epmty object', function() {
    expect(compare.compare()).toEqual({});
    expect(compare.compare([])).toEqual({});
  });
  
  it('If we send only one, then get empty object', function(){
    expect(compare.compare([bookmarks1])).toEqual({});
  });
  
  it('Find different folders with no empty links and ' +
     'links with different urls', function() {
    expect(compare.compare([bookmarks1, bookmarks2])).toEqual({
      'some': {
        data: {
          added: '112233',
          modify: '332211',
          personal: true
        },
        links: [{
          added: '22',
          icon: 'img2',
          title: 'text2',
          url: 'link2'
        },{
          added: '22',
          icon: 'img2',
          title: 'text2',
          url: 'link3'
        }],
        'andOther': {
          data: {
            added: '555',
            modify: '666'
          },
          links: [{
            added: '11',
            icon: 'img20'
          }]
        },
        'second': {
          data: {},
          links: [{
            added: '777',
            icon: 'img10'
          }]
        }
      }
    });
    
    // oposide positions
    expect(compare.compare([bookmarks2, bookmarks1])).toEqual({
      'some': {
        data: {
          added: '44',
          modify: '55'
        },
        links: [{
          added: '22',
          icon: 'img2',
          title: 'text2',
          url: 'link3'
        },{
          added: '22',
          icon: 'img2',
          title: 'text2',
          url: 'link2'
        }],
        'andOther': {
          data: {
            added: '555',
            modify: '666'
          },
          links: [{
            added: '11',
            icon: 'img20'
          }]
        },
        'second': {
          data: {},
          links: [{
            added: '777',
            icon: 'img10'
          }]
        }
      }
    });
  });
});