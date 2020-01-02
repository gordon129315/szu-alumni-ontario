console.log("events script");

$("#events .events-list a").on("click", (e) => {
    e.preventDefault();
    
    const id = $(e.target).attr('id');
    const title = $(e.target).children("div").children("span:nth-child(1)").html();
    const create_date = $(e.target).children("div").children("span:nth-child(2)").html();
    // console.log({id,title,create_date});
    
    window.location.href = '/events/' + title;
});
