var Imtech = {};
Imtech.Pager = function() {
    this.paragraphsPerPage = 3;
    this.currentPage = 1;
    this.pagingControlsContainer = '#pagingControls';
    this.pagingContainerPath = '#content';

    this.numPages = function() {
        var numPages = 0;

        var numExercises = 0;

        if (this.paragraphs != null && this.paragraphsPerPage != null) {
            for (var i =0; i < this.paragraphs.length; i++){
                if (this.paragraphs[i].style.visibility !== 'hidden'){
                    numExercises ++;
                }
            }

            numPages = Math.ceil(numExercises / this.paragraphsPerPage);
        }
        
        return numPages;
    };

    this.showPage = function(page) {
        this.currentPage = page;
        var html = '';
        this.pagingContainer.empty();

        var pageIdx = 0;
        for (var i = 0; i < this.paragraphs.length; i++){
            //this.pagingContainer.append(this.paragraphs[i]);
            if (this.paragraphs[i].style.visibility !== 'hidden'){
                pageIdx ++;
            }
            if (pageIdx === (page -1 ) * this.paragraphsPerPage + 1 
                && this.pagingContainer.is(":empty")
                && this.pagingContainer.prop('tagName') === 'OL'){
                this.pagingContainer.attr('start', i+1);
            }
            if (pageIdx >(page -1 ) * this.paragraphsPerPage && pageIdx < page * this.paragraphsPerPage + 1){
                this.pagingContainer.append(this.paragraphs[i]);
            }
        }
        //this.pagingContainer.append(this.paragraphs.slice((page-1) * this.paragraphsPerPage, ((page-1)*this.paragraphsPerPage) + this.paragraphsPerPage));

        renderControls(this.pagingControlsContainer, this.currentPage, this.numPages());
    }

    var renderControls = function(container, currentPage, numPages) {
        var pagingControls = 'Page: <ul>';
        for (var i = 1; i <= numPages; i++) {
            if (i != currentPage) {
                pagingControls += '<li><a href="#" onclick="pager.showPage(' + i + '); return false;">' + i + '</a></li>';
            } else {
                pagingControls += '<li>' + i + '</li>';
            }
        }

        pagingControls += '</ul>';

        $(container).html(pagingControls);
    }
}
