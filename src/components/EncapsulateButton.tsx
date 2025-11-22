import useStore from '../store/useStore';

export default function EncapsulateButton() {
    const nodes = useStore(state => state.nodes);
    const encapsulateNodes = useStore(state => state.encapsulateNodes);

    const handleEncapsulate = () => {
        const selectedNodeIds = nodes.filter(n => n.selected).map(n => n.id);

        if (selectedNodeIds.length < 2) {
            alert('Please select at least 2 nodes to encapsulate');
            return;
        }

        encapsulateNodes(selectedNodeIds);
    };

    // Only show button if 2+ nodes are selected
    const selectedCount = nodes.filter(n => n.selected).length;

    if (selectedCount < 2) {
        return null;
    }

    return (
        <button
            onClick={handleEncapsulate}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg transition-colors"
        >
            Encapsulate ({selectedCount} nodes)
        </button>
    );
}
