/** "Register someone at the office" above the master list: opens the registration form in office mode. */
export function OfficeRegisterLink() {
  return (
    <div className="cna-export">
      <a href="/olympiad/register?office" target="_blank" rel="noopener" className="btn btn--style-primary btn--size-small">
        Register someone at the office
      </a>
      <span>Opens the registration form for you to fill in. No online payment opens; an Admin records the fee.</span>
    </div>
  );
}
