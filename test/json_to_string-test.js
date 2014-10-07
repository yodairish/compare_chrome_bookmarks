jest.dontMock('../js/modules/json_to_string');

var JsonToString = require("../js/modules/json_to_string"),
    jsonToString = new JsonToString();

describe('JsonToString', function() {
  describe('parse', function(){
    var testedJson = {
      'Bookmarks': {
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
          }]
        }
      }
    };
    
    it('Get empty string without or empty data', function() {
      expect(jsonToString.parse()).toEqual('');
      expect(jsonToString.parse({
        json: {}
      })).toEqual('');
    });
    
    it('Get string from html representation object', function() {
        var result = '<H1>Bookmarks</H1>\n' +
                     '<DL><p>\n' +
                     '    <DT><H3 ADD_DATE="112233" LAST_MODIFIED="332211" PERSONAL_TOOLBAR_FOLDER="true">some</H3>\n' +
                     '    <DL><p>\n' +
                     '        <DT><A HREF="link" ADD_DATE="11" ICON="img">text</A>\n' +
                     '        <DT><A HREF="link2" ADD_DATE="22" ICON="img2">text2</A>\n' +
                     '    </DL><p>\n' +
                     '</DL><p>';
                 
        expect(jsonToString.parse({
          json: testedJson
        })).toEqual(result);
    });
    
    it('Get array of lines string from html representation object', function() {
        var result = ['<H1>Bookmarks</H1>',
                      '<DL><p>',
                      '    <DT><H3 ADD_DATE="112233" LAST_MODIFIED="332211" PERSONAL_TOOLBAR_FOLDER="true">some</H3>',
                      '    <DL><p>',
                      '        <DT><A HREF="link" ADD_DATE="11" ICON="img">text</A>',
                      '        <DT><A HREF="link2" ADD_DATE="22" ICON="img2">text2</A>',
                      '    </DL><p>',
                      '</DL><p>'];
                 
        expect(jsonToString.parse({
          json: testedJson,
          returnArray: true
        })).toEqual(result);
    });
  });
  
  describe('toText', function() {
      it('Get empty string without or empty array', function(){
        expect(jsonToString.toText()).toEqual('');
        expect(jsonToString.toText([])).toEqual('');
      });
      
      it('Covert lines to text', function() {
        var lines = [
              'one',
              '  two',
              'three'
            ],
            text = 'one\n' +
                   '  two\n' +
                   'three';
        expect(jsonToString.toText(lines)).toEqual(text);
      });
      
      it('If we send not array or empty array, return empty string', function(){
        expect(jsonToString.toText({})).toEqual('');
        expect(jsonToString.toText([])).toEqual('');
      });
  });
});