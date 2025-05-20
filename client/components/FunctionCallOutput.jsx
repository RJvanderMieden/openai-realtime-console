import { NotebookPen, HelpCircle } from 'lucide-react';

const FunctionCallOutput = ({ functionCallOutput }) => {
    const { name, arguments: args, timestamp } = functionCallOutput;
    
    // Parse the arguments string if it's a string, with error handling
    let parsedArgs = {};
    if (typeof args === 'string') {
        try {
            parsedArgs = JSON.parse(args);
        } catch (e) {
            parsedArgs = {};
        }
    } else if (typeof args === 'object' && args !== null) {
        parsedArgs = args;
    }
    
    // Format timestamp as HH:mm:ss in NL Amsterdam time
    let formattedTime = '';
    if (timestamp) {
        const date = new Date(timestamp);
        formattedTime = date.toLocaleTimeString('nl-NL', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            timeZone: 'Europe/Amsterdam' 
        });
    }
    
    // Determine content and styling based on function name
    let fact = '';
    let question = '';
    let factIcon = null;
    let questionIcon = null;
    let factBackgroundColor = 'bg-blue-50';
    let factBorderColor = 'border-blue-200';
    let factIconColor = 'text-blue-500';
    let questionBackgroundColor = 'bg-amber-50';
    let questionBorderColor = 'border-amber-200';
    let questionIconColor = 'text-amber-500';
    
    if (name === 'add_to_notebook') {
        fact = parsedArgs.fact || '';
        question = parsedArgs.question || '';
        factIcon = <NotebookPen className={`h-5 w-5 ${factIconColor}`} />;
        questionIcon = <HelpCircle className={`h-5 w-5 ${questionIconColor}`} />;
    } else if (name === 'add_followup_question') {
        question = parsedArgs.vraag || '';
        questionIcon = <HelpCircle className={`h-5 w-5 ${questionIconColor}`} />;
    }
    
    return (
        <div className="space-y-3">
            <div className="text-xs text-gray-400">{formattedTime}</div>
            
            {fact && (
                <div className={`rounded-lg shadow-sm border p-3 ${factBackgroundColor} ${factBorderColor}`}>
                    <div className="flex items-start gap-2">
                        <div className="mt-1">{factIcon}</div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium mb-1">Feit</div>
                            <p className="text-gray-800">{fact}</p>
                        </div>
                    </div>
                </div>
            )}
            
            {question && (
                <div className={`rounded-lg shadow-sm border p-3 ${questionBackgroundColor} ${questionBorderColor}`}>
                    <div className="flex items-start gap-2">
                        <div className="mt-1">{questionIcon}</div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-medium mb-1">Vraag</div>
                            <p className="text-gray-800">{question}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FunctionCallOutput;
