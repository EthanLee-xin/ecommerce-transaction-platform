import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Rating = ({ value = 0, text = "" }) => {
  return (
    <div className='flex items-center gap-1 text-amber-400'>
      <span>
        {value >= 1 ? <FaStar /> : value >= 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>
      <span>
        {value >= 2 ? <FaStar /> : value >= 1.5 ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>
      <span>
        {value >= 3 ? <FaStar /> : value >= 2.5 ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>
      <span>
        {value >= 4 ? <FaStar /> : value >= 3.5 ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>
      <span>
        {value >= 5 ? <FaStar /> : value >= 4.5 ? <FaStarHalfAlt /> : <FaRegStar />}
      </span>

      {text && (
        <span className='ml-2 text-xs font-semibold text-slate-500'>
          {text}
        </span>
      )}
    </div>
  );
};

export default Rating;
