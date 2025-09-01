
interface HighlightCharacterProps {
    text: string;
    highlightStart: number;
    highlightEnd: number;

}

const HighlightCharacter: React.FC<HighlightCharacterProps> = ({ text, highlightStart, highlightEnd }) => {
    
    const start = Math.max(0, highlightStart);
    const end = Math.min(text.length, highlightEnd);

    const beforeHighlight = text.slice(0, start);
    const highlightedText = text.slice(start, end);
    const afterHighlight = text.slice(end);

    return (
        <span style={{ whiteSpace: 'nowrap' }}>
            {beforeHighlight}
            <span style={{ backgroundColor: 'yellow' }}>{highlightedText}</span>
            {afterHighlight}
        </span>
    );
}

export default HighlightCharacter;