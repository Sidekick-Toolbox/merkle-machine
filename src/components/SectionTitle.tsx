const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => {
    return (
        <div className="flex flex-col">
            <h2 className="text-lg font-black font-inter">{title}</h2>
            {subtitle && <p className="text-sm font-inter">{subtitle}</p>}
        </div>
    );
};

export default SectionTitle;