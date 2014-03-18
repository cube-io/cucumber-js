var util = require("util");
//
//Output string is build as defined by:
//http://confluence.jetbrains.com/display/TCD7/Build+Script+Interaction+with+TeamCity#BuildScriptInteractionwithTeamCity-ReportingTests
//for sending test messages to teamcity.
//Args is assuemd to an array of attributes of the form [name1,value1,name2,value2,name3,value3,..,...]

function write(messagename, args) {
    var output = "##teamcity[" + messagename + " ";
        
    if (util.isArray(args))
    {
        var counter = args.length / 2;
        var i;
        for (i=0; i <= counter; i=i+2)
        {            
            //args[i] is the attribute name
            //args[i+1] is the attribute value

            output += args[i] + "=" + "|'" + args[i + 1] + "|'" + " ";
            
        }
    }

    //output += "]";
    output += "]\n";
    return output;
}
module.exports = write;
