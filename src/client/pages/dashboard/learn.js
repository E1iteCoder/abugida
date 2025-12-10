import LearnAlphabet from "../../components/learn";
export default function Learn({ currentPage, topicKey }) {
  // Convert page number to 0-based index for the component
  const adjustedPage = Math.max(0, currentPage - 1);

  return (
    <div className="Main">
      {/* Pass the adjusted 0-based page number and topicKey */}
      <LearnAlphabet currentPage={adjustedPage} topicKey={topicKey} />
    </div>
  );
}
