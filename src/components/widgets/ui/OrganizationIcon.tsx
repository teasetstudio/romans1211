interface Props {
  name: string;
  className?: string;
  size?: number;
}

const OrganizationIcon = ({ name, className = "", size = 20 }: Props) => {
  return (
    <div 
      className={`bg-gray-200 rounded flex items-center justify-center text-gray-700 ${className} text-sm font-medium`}
      style={{ width: size, height: size }}
    >
      {name?.charAt(0)}
    </div>
  );
};

export default OrganizationIcon;
