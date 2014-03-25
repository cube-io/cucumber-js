//
//Output string is build as defined by:
//http://confluence.jetbrains.com/display/TCD8/Build+Script+Interaction+with+TeamCity
//for sending test messages to teamcity.
//Args is assuemd to ba an array of attributes of the form [name1,value1,name2,value2,name3,value3,..,...]

var util = require("util");

function write(messagetype, args) {
    var output = "##teamcity[" + messagetype + " ";
        
    if (util.isArray(args))
    {
        var counter = args.length / 2;
        var i;
        for (i=0; i <= counter; i=i+2)
        {            
            //args[i] is the attribute name
            //args[i+1] is the attribute value
            output += args[i] + "=" + "'" + args[i + 1] + "'" + " ";
        }
    }
    output += "]\n";
    return output;
}
module.exports = write;
