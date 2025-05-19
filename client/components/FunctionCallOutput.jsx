import { NotebookPen, HelpCircle } from 'lucide-react';

const FunctionCallOutput = ({ functionCallOutput }) => {
    const { name, arguments: args, timestamp } = functionCallOutput;
    
    // Parse the arguments string if it's a string, with error handling
    let parsedArgs = JSON.parse(args);
    if (typeof args === 'string') {
        try {
            parsedArgs = JSON.parse(args);
        } catch (e) {
            parsedArgs = {};
        }
    } else {
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
    let content = '';
    let icon = null;
    let backgroundColor = 'bg-white';
    let borderColor = 'border-gray-200';
    let iconColor = 'text-gray-400';
    
    if (name === 'add_to_notebook') {
        content = parsedArgs.notitie;
        icon = <NotebookPen className={`h-5 w-5 ${iconColor}`} />;
        backgroundColor = 'bg-blue-50';
        borderColor = 'border-blue-200';
        iconColor = 'text-blue-500';
    } else if (name === 'add_followup_question') {
        content = parsedArgs.vraag;
        icon = <HelpCircle className={`h-5 w-5 ${iconColor}`} />;
        backgroundColor = 'bg-amber-50';
        borderColor = 'border-amber-200';
        iconColor = 'text-amber-500';
    }
    
    return (
        <div className={`rounded-lg shadow-sm border p-3 ${backgroundColor} ${borderColor}`}>
            <div className="flex items-start gap-2">
                <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">{formattedTime}</div>
                    <p className="text-gray-800">{content}</p>
                </div>
            </div>
        </div>
    );
};

export default FunctionCallOutput;
